'use strict';

import $ from 'jquery';
window.$ = $;
import 'script-loader!spin/dist/spin.js';
import 'script-loader!../../vendor/charting_library/charting_library/charting_library.js';
const TradingView = window.TradingView;
delete window.TradingView;
export default TradingView;
