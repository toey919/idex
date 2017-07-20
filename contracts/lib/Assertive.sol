pragma solidity ^0.4.11;
contract Assertive {
  function assert(bool assertion) {
    if (!assertion) throw;
  }
}
