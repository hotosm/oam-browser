'use strict';
import { defaultsDeep } from 'lodash';
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
var config = configurations.local || {};

if (process.env.DS_ENV === 'staging') {
  defaultsDeep(config, configurations.staging);
}
defaultsDeep(config, configurations.production);

module.exports = config;
