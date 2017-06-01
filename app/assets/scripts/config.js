'use strict';
import { _ } from 'lodash';
/*
 * App configuration.
 *
 * Uses settings in config/production.js, with any properties set by
 * config/staging.js or config/local.js overriding them depending upon the
 * environment.
 *
 * This file should not be modified.  Instead, modify one of:
 *
 *  - config/production.js
 *      Production settings (base).
 *  - config/staging.js
 *      Overrides to production if ENV is staging.
 *  - config/local.js
 *      Overrides if local.js exists.
 *      This last file is gitignored, so you can safely change it without
 *      polluting the repo.
 */

// Manually requiring each file, rather than globing, is easier on node.js
// when running tests.
var configurations = {
  local: require('./config/local.js'),
  staging: require('./config/staging.js'),
  production: require('./config/production.js')
};

var config;

// If the developer hasn't put anything in local.js then give them
// the values from staging.
if (_.isEmpty(configurations.local)) {
  config = configurations.staging;
} else {
  config = configurations.local;
}

// For integration tests (and as a general default) use the live catalog API.
// TODO: Testing should be idempotent - it should not be dependent on any
//       pre-existing or user-defined setup. Therefore test data should be
//       created at the point of test runs.
if (!_.has(configurations.local, 'catalog.url')) {
  _.merge(config, {
    catalog: {
      url: configurations.production.catalog.url
    }
  });
}

// Set all staging config
if (process.env.DS_ENV === 'staging') {
  config = configurations.staging;
}

// Set all production config
if (process.env.DS_ENV === 'production' || process.env.NODE_ENV === 'production') {
  config = configurations.production;
}

// Copy over any production settings that weren't specifically set above
for (var p in configurations.production) {
  if (typeof config[p] === 'undefined') {
    config[p] = configurations.production[p];
  }
}

module.exports = config;
