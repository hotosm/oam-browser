import { expect } from "chai";
import fetchMock from "fetch-mock";
import { loadComponent, waitForState } from "spec_helper";

import metaResponse from "fixtures/metadata.json";
import config from "config";
const apiBase = config.catalog.url;

describe("Imagery edit", () => {
  it("should render the imagery edit form", () => {
    let wrapper = loadComponent("components/imagery_edit");
    expect(wrapper.find(".imagery-editor")).to.have.length(1);
  });

  it("should fetch the existing imagery data", done => {
    fetchMock.mock("*", (url, _opts) => {
      expect(url).to.eq(apiBase + "/meta/1");
      return { results: metaResponse };
    });
    let wrapper = loadComponent("components/imagery_edit", {
      params: { id: "1" }
    });
    wrapper.instance().componentDidMount();
    waitForState(wrapper, ["loading", false], () => {
      const scene = wrapper.state("scenes")[0];
      expect(scene["date-start"]).to.eq("2017-05-31T22:00:00.000Z");
      expect(scene["contact-name"]).to.eq("Aeracoop");
      done();
    });
  });
});
