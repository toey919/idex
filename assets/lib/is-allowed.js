'use strict';

import allowedCurrencies from '../fixtures/allowed';
export default (selected, currency) => Boolean(~(allowedCurrencies[selected.toUpperCase()] || []).indexOf(currency.toUpperCase()));
