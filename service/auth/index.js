'use strict';

const sbssLib = require('@sap/sbss');

module.exports = sbssOptions => {
  const sbss = sbssLib(sbssOptions);

  return (username, password, cb) => {
    sbss.validateCredentials(username, password, (err, result) => {
      if (err) {
        /* eslint-disable no-console */
        console.error(`Failed to authenticate ${username}, error:`, err);
        return cb();
      }

      console.log('result.instanceId', result.instanceId);
      console.log('result.bindingId', result.bindingId);
      console.log('result.serviceId', result.serviceId);
      console.log('result.planId', result.planId);
      console.log('result.appGuid', result.appGuid);


      cb(null, { username });
    });
  };
};
