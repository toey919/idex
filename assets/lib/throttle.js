'use strict';

const { now } = Date;

export default (n) => (fn) => {
  let last = now() - n, timer;
  return () => {
    if (last + n >= now()) {
      last = now();
      fn();
    } else {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn();
        timer = undefined;
      }, last - now() + n);
    }
  };
};
