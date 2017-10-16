import "isomorphic-fetch"
import mockery from "mockery";

// All tests here should be shallow rendered and not need something
// like jsdom. So keep DOM stubs here to a minimum.
global.window = {
  document: {},
  location: {
    href: ''
  },
  addEventListener: function () {}
};

// Stub all the Leaflet code
mockery.registerMock("mapbox.js", {});

// The Youtube-style loader thing
mockery.registerMock("nprogress", {
  start: () => {},
  done: () => {},
  configure: () => {}
});

mockery.enable({
  warnOnUnregistered: false
});

global.L = {
  Control: {
    extend: () => {}
  },
  mapbox: {
    accessToken: ""
  }
};

global.OAM_UP = {};
