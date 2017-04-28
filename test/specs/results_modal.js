import _ from 'lodash';
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import ResultsPane from './scripts/components/results_pane';
import ResultsList from './scripts/components/results_list';
import { resultsPane } from './fixtures/component_defaults.js';

describe('<ResultsPane />', () => {
  it('should not render if there arent any results', () => {
    let props = _.defaults({results: []}, resultsPane);
    const wrapper = shallow(<ResultsPane {...props} />);
    expect(wrapper.find('#results-pane')).to.have.length(0);
  });

  it('should render ResultsList if a grid quad is selected', () => {
    let props = _.defaults({
      selectedItemId: '',
      selectedSquareQuadkey: '123'
    }, resultsPane);
    const wrapper = shallow(<ResultsPane {...props} />);
    expect(wrapper.find(ResultsList)).to.have.length(1);
  });

  it('should hide the zoom-to-fit-button when an image is selected', () => {
    const wrapper = shallow(<ResultsPane {...resultsPane} />);
    expect(wrapper.find('.pane-zoom-to-fit.visually-hidden')).to.have.length(0);
    wrapper.setProps({selectedItemId: 'none'}); // `null` doesn't trigger a re-render :/
    expect(wrapper.find('.pane-zoom-to-fit.visually-hidden')).to.have.length(1);
  });
});
