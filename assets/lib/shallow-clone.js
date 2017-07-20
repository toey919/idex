'use strict';

const { assign } = Object;

export default (ary) => ary.map(v => assign({}, v));
