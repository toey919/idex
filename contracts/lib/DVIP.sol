pragma solidity ^0.4.11;

contract DVIP {
  function feeFor(address from, address to, uint256 amount) constant external returns (uint256 value);
}
