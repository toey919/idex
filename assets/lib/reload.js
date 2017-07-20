'use strict';

import { reloadAndPoll } from '../client/poll-client';

export default (window.reload = () => {
  reloadAndPoll();
});
  
