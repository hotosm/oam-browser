import React from "react";
import { shallow } from "enzyme";
import fetchMock from "fetch-mock";

beforeEach(() => {
  fetchMock.restore();
});

// For some reason fethMock does not intercept fetch() calls
// unless the tested module is loaded by require() during the
// actual test run. It could be because of some interaction with
// the mockery pacakge?
export function loadComponent(componentPath, props = {}) {
  let component = require(componentPath).default;
  return shallow(React.createElement(component, props));
}

export function waitForState(wrapper, target, callback) {
  if (wrapper.state(target[0]) !== target[1]) {
    setTimeout(waitForState, 1, wrapper, target, callback);
  } else {
    callback();
  }
}
