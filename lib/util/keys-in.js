'use strict';

const {
  getPrototypeOf,
  getOwnPropertyNames,
  getOwnPropertyDescriptor,
  prototype
} = Object;

const hasValueProp = (o) => (v) => getOwnPropertyDescriptor(o, v).value;

module.exports = (o) => {
  let keys;
  do {
    keys = (keys || []).concat(getOwnPropertyNames(o).filter(hasValueProp(o)));
  } while ((o = getPrototypeOf(o)) && o !== prototype);
  return keys;
};
