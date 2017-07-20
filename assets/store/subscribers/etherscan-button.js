'use strict';

export default ({
  subscribeToEvent
}) => {
  subscribeToEvent('OPEN_ETHERSCAN_CONTRACT', (_, {
    address
  }) => {
    window.open('https://etherscan.io/address/' + address);
  });
};
