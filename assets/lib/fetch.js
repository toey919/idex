"use strict";

import request from 'browser-request';
import { env, hostname, port, protocol } from '../../config/client.json';
import { format } from 'url';

let prefix = '';
if (env === 'development') prefix += format({
  hostname,
  port,
  protocol
});

export default (cfg = {}) => {
  return new Promise((resolve, reject) => {
    if (prefix) cfg.url = prefix + String(cfg.url);
    request(cfg, (err, resp, body) => {
      if (err) return reject(err);
      resolve(resp);
    });
  });
};
