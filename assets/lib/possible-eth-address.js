'use strict';

const ethAddress = '0x' + Array(41).join('0');
const possibleEthAddresses = ['0', '0x0', ethAddress, 0];
const isPossibleEthAddress = (v) => possibleEthAddresses.includes(v);

export default isPossibleEthAddress;
