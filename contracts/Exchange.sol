pragma solidity ^0.4.11;

import "./lib/Math.sol";
import "./lib/Owned.sol";
import "./lib/Token.sol";

contract Exchange is Math, Owned {

  mapping (address => mapping (address => uint256)) public tokens; //mapping of token addresses to mapping of account balances

  mapping (address => bool) public admins;
  mapping (bytes32 => uint256) public orderFills;
  address public feeAccount;
  uint256 public inactivityReleasePeriod;
  uint256 public lastActiveTransaction;
  mapping (bytes32 => bool) public traded;
  mapping (bytes32 => bool) public withdrawn;
  event Order(address tokenBuy, uint256 amountBuy, address tokenSell, uint256 amountSell, uint256 expires, uint256 nonce, address user, uint8 v, bytes32 r, bytes32 s);
  event Cancel(address tokenBuy, uint256 amountBuy, address tokenSell, uint256 amountSell, uint256 expires, uint256 nonce, address user, uint8 v, bytes32 r, bytes32 s);
  event Trade(address tokenBuy, uint256 amountBuy, address tokenSell, uint256 amountSell, address get, address give);
  event Deposit(address token, address user, uint256 amount, uint256 balance);
  event Withdraw(address token, address user, uint256 amount, uint256 balance);

  function setInactivityReleasePeriod(uint256 expiry) onlyAdmin returns (bool success) {
    inactivityReleasePeriod = expiry;
    return true;
  }
  function setLastActiveTransactionToThisBlock() onlyAdmin internal returns (bool success) {
    lastActiveTransaction = block.number;
    return true;
  }
  struct OrderRecord {
    address tokenBuy;
    uint256 amountBuy;
    address tokenSell;
    uint256 amountSell;
    uint256 expires;
    uint256 nonce;
    address user;
    uint8 v;
    bytes32 r;
    bytes32 s;
  }

  mapping (bytes32 => OrderRecord) public orderBook;

  function Exchange(address feeAccount_) {
    feeAccount = feeAccount_;
    inactivityReleasePeriod = 10000;
  }

  function setAdmin(address admin, bool isAdmin) onlyOwner {
    admins[admin] = isAdmin;
  }

  modifier onlyAdmin {
    if (msg.sender != owner && !admins[msg.sender]) throw;
    _;
  }

  function() {
    throw;
  }

  function depositToken(address token, uint256 amount) {
    tokens[token][msg.sender] = safeAdd(tokens[token][msg.sender], amount);
    if (!Token(token).transferFrom(msg.sender, this, amount)) throw;
    Deposit(token, msg.sender, amount, tokens[token][msg.sender]);
  }

  function deposit() payable {
    tokens[0x0000000000000000000000000000000000000000][msg.sender] = safeAdd(tokens[0x0000000000000000000000000000000000000000][msg.sender], msg.value);
    Deposit(0x0000000000000000000000000000000000000000, msg.sender, msg.value, tokens[0x0000000000000000000000000000000000000000][msg.sender]);
  }

  function withdraw(address token, uint256 amount) returns (bool success) {
    if (safeSub(block.number, lastActiveTransaction) < inactivityReleasePeriod + block.number) throw;
    if (tokens[token][msg.sender] < amount) throw;
    tokens[token][msg.sender] = safeSub(tokens[token][msg.sender], amount);
    if (token == address(0)) {
      if (!msg.sender.send(amount)) throw;
    } else {
      if (!Token(token).transfer(msg.sender, amount)) throw;
    }
    Withdraw(token, msg.sender, amount, tokens[token][msg.sender]);
  }

  function adminWithdraw(address token, uint256 amount, address user, uint256 nonce, uint8 v, bytes32 r, bytes32 s) onlyAdmin returns (bool success) {
    bytes32 hash = sha3(this, token, amount, user, nonce);
    if (withdrawn[hash]) throw;
    withdrawn[hash] = true;
    if (ecrecover(sha3("\x19Ethereum Signed Message:\n32", hash), v, r, s) != user) throw;
    if (tokens[token][user] < amount) throw;
    tokens[token][user] = safeSub(tokens[token][user], amount);
    if (token == address(0)) {
      if (!user.send(amount)) throw;
    } else {
      if (!Token(token).transfer(user, amount)) throw;
    }
    Withdraw(token, user, amount, tokens[token][user]);
  }

  function balanceOf(address token, address user) constant returns (uint256) {
    return tokens[token][user];
  }

  uint256 internal feeTake;
  uint256 internal feeMake;
  uint256 internal feeTerm;
  bytes32 internal tradeHash;

  function order(address tokenBuy, uint256 amountBuy, address tokenSell, uint256 amountSell, uint256 expires, uint256 nonce, address user, uint8 v, bytes32 r, bytes32 s) returns (bool success) {
    bytes32 hash = sha3(this, tokenBuy, amountBuy, tokenSell, amountSell, expires, nonce, user);
    orderBook[hash].tokenBuy = tokenBuy;
    orderBook[hash].amountBuy = amountBuy;
    orderBook[hash].tokenSell = tokenSell;
    orderBook[hash].amountSell = amountSell;
    orderBook[hash].expires = expires;
    orderBook[hash].nonce = nonce;
    orderBook[hash].user = user;
    orderBook[hash].v = v;
    orderBook[hash].r = r;
    orderBook[hash].s = s;
    return true;
  }

  uint256 internal feePart;

  function trade(bytes32 hash, address user, uint256 nonce, uint8 v, bytes32 r, bytes32 s, uint256 amount, uint256 feeMake, uint256 feeTake) onlyAdmin returns (bool success) {
    /* amount is in amountBuy terms */
    tradeHash = sha3(hash, amount, user, nonce);
    if (traded[tradeHash]) throw;
    traded[tradeHash] = true;
    address u = ecrecover(sha3("\x19Ethereum Signed Message:\n32", tradeHash), v, r, s);
    if (user != u) throw;
/*   block.number <= orderBook[hash].expires && */
    if (safeAdd(orderFills[hash], amount) > orderBook[hash].amountBuy) throw;
    if (tokens[orderBook[hash].tokenBuy][user] < amount) throw;
    if (tokens[orderBook[hash].tokenSell][orderBook[hash].user] < (safeMul(orderBook[hash].amountSell, amount) / orderBook[hash].amountBuy)) throw;
    tokens[orderBook[hash].tokenBuy][user] = safeSub(tokens[orderBook[hash].tokenBuy][user], amount);
    feeTerm = safeMul(amount, ((1 ether) - feeMake)) / (1 ether);
    tokens[orderBook[hash].tokenBuy][orderBook[hash].user] = safeAdd(tokens[orderBook[hash].tokenBuy][orderBook[hash].user], feeTerm);
    feeTerm = safeMul(amount, feeMake) / (1 ether);
    tokens[orderBook[hash].tokenBuy][feeAccount] = safeAdd(tokens[orderBook[hash].tokenBuy][feeAccount], feeTerm);
    feeTerm = safeMul(orderBook[hash].amountSell, amount) / orderBook[hash].amountBuy;
    tokens[orderBook[hash].tokenSell][orderBook[hash].user] = safeSub(tokens[orderBook[hash].tokenSell][orderBook[hash].user], feeTerm);
    feePart = safeMul(((1 ether) - feeTake), orderBook[hash].amountSell);
    feeTerm = safeMul(feePart, amount) / orderBook[hash].amountBuy / (1 ether);
    tokens[orderBook[hash].tokenSell][user] = safeAdd(tokens[orderBook[hash].tokenSell][user], feeTerm);
    feePart = safeMul(safeMul(feeTake, orderBook[hash].amountSell), amount);
    feeTerm = feePart / orderBook[hash].amountBuy / (1 ether);
    tokens[orderBook[hash].tokenSell][feeAccount] = safeAdd(tokens[orderBook[hash].tokenSell][feeAccount], feeTerm);
    orderFills[hash] = safeAdd(orderFills[hash], amount);
    // Trade(orderBook[hash].tokenBuy, amount, orderBook[hash].tokenSell, orderBook[hash].amountSell * amount / orderBook[hash].amountBuy, orderBook[hash].user, user);
  }
}

