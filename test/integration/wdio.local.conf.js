// It should be staight forward to run these tests against a local
// browser using either Firefox or Chrome's Web Driver APIs. There
// is no need to install Selenium.
//
// https://sites.google.com/a/chromium.org/chromedriver/
// https://github.com/mozilla/geckodriver

const _ = require("lodash");
const defaultConf = require("./wdio.default.conf.js").config;

const browserStackConf = {
  host: process.env.WD_HOST || "localhost",
  port: process.env.WD_PORT || 9515,
  path: process.env.WD_PATH || "/wd/hub",

  capabilities: [
    {
      browser: process.env.WD_BROWSER || "chromium"
    }
  ]
};

// Merge with the default config
exports.config = _.defaults(browserStackConf, defaultConf);
