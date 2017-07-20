'use strict';

function allKeys(v) {
  let keys = [];
  for (var i in v) {
    keys.push(i);
  }
  return keys;
}

function buildTree(o) {
  let retval = {};
  retval.root = allKeys(o);
  retval.root.forEach((v) => {
    if (typeof o[v] === 'object' && !Array.isArray(o[v])) {
      retval[v] = allKeys(o[v]);
    }
  });
  return retval;
}

export default buildTree;
