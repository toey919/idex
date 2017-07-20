'use strict';

export default (el) => (target) => {
  while (target) {
    if (target.nodeName.toUpperCase() === el.toUpperCase()) break;
    target = target.parentElement;
  }
  return target;
};
