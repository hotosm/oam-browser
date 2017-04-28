'use strict';
const os = require('os');
const _ = require('lodash');
const defaultConf = require('./wdio.default.conf.js').config;

const date = new Date();
const time = date.toLocaleTimeString();

const buildDefaults = {
  project: 'hotosm/oam-browser',
  build: process.env.CIRCLE_BUILD_NUM || `${os.hostname()} ${time}`,
  name: 'Frontend tests',
  os: 'WINDOWS',
  os_version: '10',
  'browserstack.debug': true,
  'browserstack.local': true
};

let browserStackConf = {
  user: process.env.BSTACK_USER,
  key: process.env.BSTACK_KEY,

  // This module gives us the Browser Stack Local tool and
  // REST requests to set the status of each test run.
  services: ['browserstack'],
  browserstackLocal: true,

  // TODO: Safari is difficult to trigger a click on the map with.
  // Safari 10.0 has better support for moveTo() commands, but
  // it has other problems. Look into selectively running tests
  // depending on which browsers support the required commands
  // for that test.
  capabilities: [{
    browserName: 'chrome'
  }, {
    browserName: 'firefox'
  }, {
    browserName: 'internet explorer'
  }].map(function (browser) {
    return _.defaults(browser, buildDefaults);
  }),

  maxInstances: 2 // Limit for free accounts
};

// Merge with the default config
exports.config = _.defaults(browserStackConf, defaultConf);

