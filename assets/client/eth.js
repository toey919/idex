"use strict"

const { rpcToken, env } = require("../../config/client")
const Web3 = require("web3")
const HookedWeb3Provider = require("hooked-web3-provider")
const Transaction = require("ethereumjs-tx")
const { format } = require("url")
const { bufferToHex } = require("ethereumjs-util")
const { openEthereumPanel } = require("../actions/ethereum-panel")
const defer = require("../lib/defer")
import setImmediate from "../lib/set-immediate"
const partial = require("lodash/partial")
const property = require("lodash/property")
const bindKey = require("lodash/bindKey")
const { parse } = JSON
const { fromV3 } = require("ethereumjs-wallet")
const { mapSeries } = require("bluebird")
const exchangeContract = require("../../contracts/Exchange.sol.json")
const tokenContract = require("../../contracts/Token.sol.json")
const { create, assign } = Object
const { now } = Date
const exportSingleton = require("../../lib/singleton")
const { resolve } = require("../../lib/promise")
const back = ary => ary[ary.length - 1]
const { getState, dispatch } = require("../store/container")
const BigNumber = require("big-number")
const { all } = require("../../lib/promise")
const coder = require("web3/lib/solidity/coder")
const encodeParams = bindKey(coder, "encodeParams")
const ln = v => {
	console.log(v)
	return v
}

let wallets = []
const detachedWeb3 = new Web3()
const { sha3, fromDecimal } = detachedWeb3
const hashFromAbi = (abi, name) => {
	const entry = abi.find(v => v.name === name)
	const argString = "(" + entry.inputs.map(({ type }) => type).join(",") + ")"
	return sha3(name + argString).substr(0, 10)
}

function PromisifiedEth() {}
assign(
	PromisifiedEth.prototype,
	{
		getWeb3() {
			return this._web3
		},
		getEth() {
			return this.getWeb3().eth
		},
		getContract(abi, address) {
			return this.getEth().contract(abi).at(address)
		},
		getMarketContract(address) {
			return this.getContract(exchangeContract.abi, address)
		},
		getMarketContractFromState() {
			return this.getMarketContract(getState().address)
		},
		getTokenContract(address) {
			return this.getContract(tokenContract.abi, address)
		},
		estimateGas(contract, fn, ...args) {
			return new Promise((resolve, reject) => {
				contract[fn].estimateGas(
					...[
						...args,
						(err, result) => {
							if (err) return reject(err)
							resolve(result)
						}
					]
				)
			})
		},
		sendTransaction(contract, fn, ...args) {
			return all([this.getGasPrice(), this.estimateGas(contract, fn, ...args)]).then(([gasPrice, gas]) => {
				gas = String(BigNumber(gas).add(10000))
				return new Promise((resolve, reject) => {
					const { selectedAccount: from } = getState()
					if (typeof back(args) === "object")
						assign({}, back(args), {
							gas,
							from,
							gasPrice
						})
					else
						args.push({
							gas,
							from,
							gasPrice
						})
					contract[fn].sendTransaction(
						...[
							...args,
							(err, tx) => {
								if (err) return reject(err)
								resolve(tx)
							}
						]
					)
				})
			})
		},
		sendRawTransactionFormat(contract, fn, ...args) {
			const { txpoll, selectedAccount } = getState()
			if (txpoll.find(({ from }) => from === selectedAccount)) {
				const err = PendingError("Transaction is already pending from this address")
				const promise = Promise.reject(err)
				dispatch({
					type: "LOAD_ERROR",
					payload: err.message
				})
				return {
					mined: promise,
					submitted: promise
				}
			}
			const submittedDeferred = defer(),
				minedDeferred = defer()
			const retval = {
				submitted: submittedDeferred.promise,
				mined: minedDeferred.promise
			}
			submittedDeferred.promise.catch(err => {
				if (err.message.match(/Error:\s+User\s+denied\s+/)) {
					return setImmediate(() =>
						dispatch({
							type: "LOAD_ERROR",
							payload: "Error: User denied transaction signature."
						})
					)
				}
				throw err
			})
			const handleErr = err => {
				submittedDeferred.reject(err)
				minedDeferred.reject(err)
			}
			all([this.getGasPrice(), this.estimateGas(contract, fn, ...args), this.getTransactionCount(getState().selectedAccount, "pending"), this.getBlockNumber(), this.getGasLimit()]).then(([gasPrice, gasLimit, nonce, number, realLimit]) => {
				const cap = String(BigNumber(realLimit).minus(10000))
				if (BigNumber(gasLimit).gt(cap)) gasLimit = cap
				gasLimit = fromDecimal(String(BigNumber(gasLimit).add(10000)))
				gasPrice = fromDecimal(gasPrice)
				nonce = fromDecimal(nonce)
				const from = getState().selectedAccount
				let params
				if (typeof back(args) === "object") {
					params = assign({}, back(args), {
						gasLimit,
						from,
						gasPrice
					})
					args.splice(args.length - 1, 1)
				} else
					params = {
						gasLimit,
						from,
						gasPrice
					}
				if (!params.value) params.value = "0x00"
				const data = hashFromAbi(contract.abi, fn) + encodeParams(contract.abi.find(({ name }) => name === fn).inputs.map(({ type }) => type), args)
				const to = contract.address
				const tx = new Transaction(
					assign({}, params, {
						to,
						from,
						nonce,
						data
					})
				)
				tx.sign(getWallet().getPrivateKey())
				this.sendRawTransaction(bufferToHex(tx.serialize()))
					.then(tx => {
						submittedDeferred.resolve(tx)
						dispatch({
							type: "TRANSACTION_DISPATCHED",
							payload: {
								tx,
								resolve: minedDeferred.resolve,
								fn,
								from,
								number,
								time: now(),
								address: contract.address,
								args: args.slice(0, -2)
							}
						})
						openEthereumPanel()
					})
					.catch(handleErr)
			})
			return retval
		},
		call(contract, fn, ...args) {
			return new Promise((resolve, reject) => {
				contract[fn].call(
					...[
						...args,
						(err, result) => {
							if (err) return reject(err)
							resolve(result)
						}
					]
				)
			})
		}
	},
	["getAccounts", "getBalance", "getBlock", "getBlockNumber", "getBlockTransactionCount", "getBlockUncleCount", "getCode", "getCoinbase", "getCompilers", "getGasPrice", "getHashrate", "getMining", "getProtocolVersion", "getStorageAt", "getSyncing", "getTransaction", "sendRawTransaction", "getTransactionCount", "getTransactionFromBlock", "getTransactionReceipt", "getUncle", "getWork"].reduce((r, v) => {
		r[v] = function(...args) {
			return new Promise((resolve, reject) => {
				this.getEth()[v](
					...[
						...args,
						(err, result) => {
							if (err) return reject(err)
							resolve(result)
						}
					]
				)
			})
		}
		return r
	}, {})
)

const StaticProto = assign(
	create(PromisifiedEth.prototype),
	["toHex", "toAscii", "toUtf8", "fromAscii", "fromUtf8", "toDecimal", "fromDecimal", "toBigNumber", "toWei", "fromWei", "isAddress", "isChecksumAddress", "toChecksumAddress", "isIBAN", "sha3", "fromICAP"].reduce((r, v) => {
		r[v] = detachedWeb3[v]
		return r
	}, {})
)

function Web3StaticMethods() {}
Web3StaticMethods.prototype = StaticProto
Web3StaticMethods.prototype.constructor = Web3StaticMethods

class EthereumClient extends Web3StaticMethods {
	constructor(_web3, _cfg) {
		super(_web3, _cfg)
		assign(this, {
			_web3,
			_cfg
		})
	}
	getGasLimit() {
		return this.getBlock("latest").then(property("gasLimit"))
	}
	pollAll() {
		mapSeries(getState().txpoll, v => {
			let result
			return this.getTransactionReceipt(v.tx)
				.then(_result => {
					result = _result
					return this.getBlockNumber()
				})
				.then(number => {
					if (result && ((result.logs && result.logs.find(u => u.type === "mined")) || result.blockNumber <= number)) {
						dispatch({
							type: "TRANSACTION_MINED",
							payload: {
								...v,
								receipt: result
							}
						})
						openEthereumPanel()
						if (v.resolve) {
							console.log("resolved")
							v.resolve(result)
						}
					}
				})
		}).catch(err => console.log(err.stack))
	}
}

let instance

const instantiateEthereumClient = () => {
	const web3 = new Web3(
		new HookedWeb3Provider({
			host: format({
				protocol: "https:",
				hostname: ((env === "development" && "ropsten") || "mainnet") + ".infura.io",
				port: 443,
				pathname: rpcToken
			}),
			transaction_signer: {
				hasAddress: (address, cb) => {
					cb(null, Boolean(wallets.find(v => address.toLowerCase() === "0x" + v.getAddress().toString("hex").toLowerCase())))
				},
				signTransaction: (params, cb) => {
					const { from } = params
					const wallet = wallets.find(v => from.toLowerCase() === "0x" + v.getAddress().toString("hex").toLowerCase())
					const tx = new Transaction(params)
					tx.sign(wallet.getPrivateKey())
					console.log(params)
					cb(null, tx.serialize())
				}
			}
		})
	)
	instance = new EthereumClient(web3, {})
	return resolve(instance)
}

const setWallet = (v3, password) => {
	wallets = [fromV3(v3, password)]
}

setImmediate(() => {
	if (getState().wallet && getState().walletPassword) {
		setWallet(getState().wallet, getState().walletPassword)
	}
})

const getWallets = () => wallets
const getWallet = () => wallets[0]

const getEthereum = () => instance

export default exportSingleton(getEthereum, EthereumClient.prototype, {
	getEthereum,
	EthereumClient,
	instantiateEthereumClient,
	getWallets,
	setWallet,
	getWallet
})
