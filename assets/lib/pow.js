'use strict';

import BigRational from 'big-rational';

export default (base, n) => {
  return BigRational(base).pow(n).toDecimal();
};
