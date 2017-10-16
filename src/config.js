import _ from "lodash";
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
  local: require("./config/local.js"),
  test: require("./config/test.js"),
  staging: require("./config/staging.js"),
  production: require("./config/production.js")
};

var config;

// If the developer hasn't put anything in local.js then give them
// the values from staging.
if (_.isEmpty(configurations.local)) {
  config = configurations.staging;
} else {
  config = configurations.local;
}

if (
  process.env.NODE_ENV === "test" ||
  process.env.REACT_APP_OAM_ENV === "test"
) {
  config = configurations.test;
}

// Set all staging config
if (process.env.REACT_APP_OAM_ENV === "staging") {
  config = configurations.staging;
}

// Set all production config
// Create React App hardcodes NODE_ENV so we need another marker to make sure
// the `config.js` correctly loads the correct config.
if (process.env.REACT_APP_OAM_ENV === "production") {
  config = configurations.production;
}

// Copy over any production settings that weren't specifically set above
// TODO: Explicitly declare each environment's config. Defaulting to production
//   could be dangerous.
for (var p in configurations.production) {
  if (typeof config[p] === "undefined") {
    config[p] = configurations.production[p];
  }
}

export default config;
