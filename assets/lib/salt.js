const { fromAscii, sha3 } = new (require('web3'))();
const salt = fromAscii('\x19Ethereum Signed Message:\n32');
const saltHash = (hash) => sha3(salt + hash.substr(2), { encoding: 'hex' });
export default saltHash;
