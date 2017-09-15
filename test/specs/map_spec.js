import { expect } from "chai";
import fetchMock from "fetch-mock";
import { loadComponent } from "spec_helper";

import config from "config";
import { mapBoxMap } from "fixtures/component_defaults";

const apiBase = config.catalog.url;

describe("The Map", () => {
  describe("Specs not concerning API", () => {
    beforeEach(() => {
      fetchMock.mock("*", { results: [] });
    });

    it("should render the map", () => {
      let wrapper = loadComponent("components/map", mapBoxMap);
      expect(wrapper.find("#map")).to.have.length(1);
    });
  });

  it("should fetch initial API requests", done => {
    let requests = {};
    fetchMock.mock("*", (url, opts) => {
      requests[url] = opts;
      if (Object.keys(requests).length === 2) {
        expect(requests).to.include.keys([
          apiBase + "/meta?limit=99999",
          apiBase + "/meta?order_by=acquisition_end&sort=desc&limit=10"
        ]);
        done();
      }
      return { results: [] };
    });
    loadComponent("components/map", mapBoxMap);
  });
});
