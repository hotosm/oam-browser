const os = require("os");
const _ = require("lodash");
const defaultConf = require("./wdio.default.conf.js").config;

const date = new Date();
const time = date.toLocaleTimeString();
const tunnelId = Math.random()
  .toString(36)
  .slice(2);

let browserStackConf = {
  user: process.env.BSTACK_USER,
  key: process.env.BSTACK_KEY,

  // This module gives us the Browser Stack Local tool and
  // REST requests to set the status of each test run.
  services: ["browserstack"],
  browserstackLocal: true,

  browserstackOpts: {
    // `forceLocal` asks all web requests to be routed through the test
    // machine and not Browserstack's machines. This lets our frontend
    // XHR calls to reach the docker-based Catalog API.
    forceLocal: "true",
    // Because of the way the BrowserstackLocal binary works, it's possible
    // for other tests running at the same time (most likely parallel
    // Travis jobs) to all clobber the same connection. So we need to
    // manually give each connection a unique identifier.
    localIdentifier: tunnelId
  },

  capabilities: [
    {
      browserName: process.env.BROWSER || "chrome",
      project: "hotosm/oam-browser(" + process.env.TRAVIS_BRANCH + ")",
      build: process.env.TRAVIS_BUILD_NUMBER || `${os.hostname()} ${time}`,
      name:
        "Against API from " +
        (process.env.CATALOG_API_VERSION || process.env.TRAVIS_BRANCH),
      os: "WINDOWS",
      os_version: "8",
      "browserstack.debug": true,
      "browserstack.local": true,
      "browserstack.networkLogs": true,
      "browserstack.localIdentifier": tunnelId
    }
  ]
};

// Merge with the default config
exports.config = _.defaults(browserStackConf, defaultConf);
