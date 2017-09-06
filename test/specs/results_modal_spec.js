import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";

import ResultsPane from "components/results_pane";
import ResultsList from "components/results_list";
import { resultsPane } from "fixtures/component_defaults";

let props;

beforeEach(() => {
  props = Object.assign({}, resultsPane);
});

describe("<ResultsPane />", () => {
  it("should not render if there arent any results", () => {
    props.results = [];
    const wrapper = shallow(<ResultsPane {...props} />);
    expect(wrapper.find("#results-pane")).to.have.length(0);
  });

  it("should render ResultsList if a grid quad is selected", () => {
    props.selectedItemId = "";
    props.selectedSquareQuadkey = "123";
    const wrapper = shallow(<ResultsPane {...props} />);
    expect(wrapper.find(ResultsList)).to.have.length(1);
  });

  it("should hide the zoom-to-fit-button when an image is selected", () => {
    const wrapper = shallow(<ResultsPane {...resultsPane} />);
    expect(wrapper.find(".pane-zoom-to-fit.visually-hidden")).to.have.length(0);
    wrapper.setProps({ selectedItemId: "none" }); // `null` doesn't trigger a re-render :/
    expect(wrapper.find(".pane-zoom-to-fit.visually-hidden")).to.have.length(1);
  });
});
