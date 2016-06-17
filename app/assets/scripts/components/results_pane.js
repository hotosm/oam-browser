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
    mapView: React.PropTypes.string,
    results: React.PropTypes.array,
    selectedItemId: React.PropTypes.string,
    selectedSquareQuadkey: React.PropTypes.string
  },

  mixins: [
    Keys
  ],

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

  closeResults: function (e) {
    if (e) {
      e.preventDefault();
    }
    hashHistory.push({pathname: this.props.mapView, query: this.props.query});
  },

  render: function () {
    console.log('results pane render', this.props);

    var resultsPane = null;
    if (this.props.results.length && this.props.selectedItemId) {
      var i = _.findIndex(this.props.results, {_id: this.props.selectedItemId});
      var pg = {
        total: this.props.results.length,
        current: i + 1,
        prevId: i > 0 ? this.props.results[i - 1]._id : null,
        nextId: i < this.props.results.length - 1 ? this.props.results[i + 1]._id : null
      };
      resultsPane = <ResultsItem
        query={this.props.query}
        mapView={this.props.mapView}
        selectedSquareQuadkey={this.props.selectedSquareQuadkey}
        data={this.props.results[i]}
        pagination={pg} />;
    } else if (this.props.results.length && this.props.selectedSquareQuadkey) {
      resultsPane = <ResultsList
        query={this.props.query}
        mapView={this.props.mapView}
        selectedSquareQuadkey={this.props.selectedSquareQuadkey}
        results={this.props.results} />;
    } else {
      // No results, no pane.
      return null;
    }

    return (
      <div id='results-pane' className='pane'>
        <a href='' onClick={this.closeResults} className='pane-dismiss' title='Exit selection'><span>Close</span></a>
        <Dropdown
          triggerElement='a'
          triggerClassName='pane-more'
          triggerActiveClassName='button--active'
          triggerTitle='More options'
          triggerText='More options'
          direction='down'
          alignment='right'>
          <ul className='drop__menu info-menu' role='menu'>
            <li><a className='drop__menu-item' href={`https://twitter.com/share?url=${encodeURIComponent(window.location.href)}`} target='_blank' title='Share on twitter' data-hook='dropdown:close'><span>Share on Twitter</span></a></li>
            <li><a className='drop__menu-item' href={`http://facebook.com/sharer.php?u=${encodeURIComponent(window.location.href)}`} target='_blank' title='Share on Facebook' data-hook='dropdown:close'><span>Share on Facebook</span></a></li>
          </ul>
          <ul className='drop__menu info-menu' role='menu'>
            <li><a className='drop__menu-item' title='Report a problem' data-hook='dropdown:close' onClick={this.feedbackClickHandler}><span>Report a problem</span></a></li>
          </ul>
        </Dropdown>
        {resultsPane}
      </div>
    );
  }
});

module.exports = ResultsPane;
