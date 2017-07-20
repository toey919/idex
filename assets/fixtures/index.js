'use strict';

import fixtures from './fixtures';
import lessVariables from '!less-to-json-loader!../style/variables.less';
import transformLessVariables from '../lib/transform-less-variables';

const { assign } = Object;

export default (window.fixtures = assign(transformLessVariables(lessVariables), fixtures));
