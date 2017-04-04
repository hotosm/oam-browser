'use strict';
import { hashHistory } from 'react-router';
import React from 'react';
import Keys from 'react-keybinding';
import _ from 'lodash';
import { Dropdown } from 'oam-design-system';

import ResultsList from './results_list';
import ResultsItem from './results_item';
import actions from '../actions/actions';

var ResultsPane = React.createClass({
  displayName: 'ResultsPane',

  propTypes: {
    query: React.PropTypes.object,
    map: React.PropTypes.object,
    results: React.PropTypes.array,
    selectedItemId: React.PropTypes.string,
    selectedSquareQuadkey: React.PropTypes.string
  },

  mixins: [
    Keys
  ],

  // Populated only when a single imagery result is selected.
  currentResult: null,

  keybindings: {
    'esc': function () {
      if (this.props.results.length === 0) {
        return;
      }
      this.closeResults();
    }
  },

  feedbackClickHandler: function (e) {
    e.preventDefault();
    actions.openModal('feedback');
  },

  zoomToFit: function (e) {
    e.preventDefault();
    const bbox = this.currentResult.bbox;
    actions.fitToBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
  },

  closeResults: function (e) {
    if (e) {
      e.preventDefault();
    }
    hashHistory.push({pathname: this.props.map.view, query: this.props.query});
  },

  render: function () {
    var resultsPane = null;
    if (this.props.results.length && this.props.selectedItemId) {
      var i = _.findIndex(this.props.results, {_id: this.props.selectedItemId});
      this.currentResult = this.props.results[i];
      var pg = {
        total: this.props.results.length,
        current: i + 1,
        prevId: i > 0 ? this.props.results[i - 1]._id : null,
        nextId: i < this.props.results.length - 1 ? this.props.results[i + 1]._id : null
      };
      resultsPane = <ResultsItem
        query={this.props.query}
        map={this.props.map}
        selectedSquareQuadkey={this.props.selectedSquareQuadkey}
        data={this.currentResult}
        pagination={pg} />;
    } else if (this.props.results.length && this.props.selectedSquareQuadkey) {
      resultsPane = <ResultsList
        query={this.props.query}
        map={this.props.map}
        selectedSquareQuadkey={this.props.selectedSquareQuadkey}
        results={this.props.results} />;
    } else {
      // No results, no pane.
      return null;
    }

    return (
      <div id='results-pane' className='pane'>
        <Dropdown
          triggerElement='a'
          triggerClassName='pane-more'
          triggerActiveClassName='button--active'
          triggerTitle='More options'
          triggerText='More options'
          direction='down'
          alignment='right'>

          <ul className='drop__menu info-menu' role='menu'>
            <li>
              <a
                className='drop__menu-item'
                href={`https://twitter.com/share?url=${encodeURIComponent(window.location.href)}`}
                target='_blank'
                title='Share on twitter'
                data-hook='dropdown:close'>
                <span>Share on Twitter</span>
              </a>
            </li>

            <li>
              <a
                className='drop__menu-item'
                href={`http://facebook.com/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target='_blank'
                title='Share on Facebook'
                data-hook='dropdown:close'>
                <span>Share on Facebook</span>
              </a>
            </li>
          </ul>

          <ul className='drop__menu info-menu' role='menu'>
            <li>
              <a
                className='drop__menu-item'
                title='Report a problem'
                data-hook='dropdown:close'
                onClick={this.feedbackClickHandler}>
                <span>Report a problem</span>
              </a>
            </li>
          </ul>
        </Dropdown>

        <a href='' onClick={this.closeResults} className='pane-dismiss' title='Exit selection'>
          <span>Close</span>
        </a>

        <a
          href=''
          onClick={this.zoomToFit}
          className={`pane-zoom-to-fit ${this.currentResult === null && 'visually-hidden'}`}
          title='Zoom to fit imagery on screen'>
          <span>Zoom To Fit</span>
        </a>

        {resultsPane}
      </div>
    );
  }
});

module.exports = ResultsPane;
