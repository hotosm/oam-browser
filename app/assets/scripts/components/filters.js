'use strict';
import { hashHistory } from 'react-router';
import React from 'react';
import Reflux from 'reflux';
import { Dropdown } from 'oam-design-system';

import actions from '../actions/actions';
import searchQueryStore from '../stores/search_query_store';
import cookie from '../utils/cookie';
import config from '../config.js';

var Filters = React.createClass({
  displayName: 'Filters',

  propTypes: {
    query: React.PropTypes.object,
    params: React.PropTypes.object
  },

  mixins: [
    Reflux.listenTo(searchQueryStore, 'onSearchQuery')
  ],

  getInitialState: function () {
    return {
      date: 'all',
      resolution: 'all',
      dataType: 'all'
    };
  },

  onSearchQuery: function (data) {
    this.setState(data);
  },

  setDate: function (d) {
    actions.setDateFilter(d.key);
    this._updateUrl('date', d.key);
  },

  setResolution: function (d) {
    actions.setResolutionFilter(d.key);
    this._updateUrl('resolution', d.key);
  },

  setDataType: function (d) {
    actions.setDataTypeFilter(d.key);
    this._updateUrl('type', d.key);
  },

  _updateUrl: function (prop, value) {
    var query = this.props.query;
    if (value === 'all') {
      delete query[prop];
    } else {
      query[prop] = value;
    }

    var mapView = this.props.params.map;
    if (!mapView) {
      var cookieView = cookie.read('oam-browser:map-view');
      if (cookieView !== 'undefined') {
        mapView = cookie.read('oam-browser:map-view');
      } else {
        mapView = config.map.initialView.concat(config.map.initialZoom).join(',');
      }
    }

    hashHistory.push({pathname: mapView, query: query});
  },

  render: function () {
    function filterItem (property, clickHandler, d) {
      var klass = this.state[property] === d.key ? 'drop__menu-item--active' : '';
      var click = clickHandler.bind(this, d);
      return (
        <li key={property + '-filter-' + d.key}>
          <a onClick={click} title={d.title} className={`drop__menu-item ${klass}`}>{d.title}</a>
        </li>);
    }

    var dates = [
      {key: 'all', title: 'All'},
      {key: 'week', title: 'Last week'},
      {key: 'month', title: 'Last month'},
      {key: 'year', title: 'Last year'}
    ].map(filterItem.bind(this, 'date', this.setDate));

    var resolutions = [
      {key: 'all', title: 'All'},
      {key: 'low', title: 'Low'},
      {key: 'medium', title: 'Medium'},
      {key: 'high', title: 'High'}
    ].map(filterItem.bind(this, 'resolution', this.setResolution));

    var dataTypes = [
      {key: 'all', title: 'All Images'},
      {key: 'service', title: 'Image + Map Layer'}
    ].map(filterItem.bind(this, 'dataType', this.setDataType));

    return (
      <Dropdown
        className='drop__content--filters'
        triggerElement='a'
        triggerClassName='button-filters'
        triggerActiveClassName='button--active'
        triggerTitle='Settings'
        triggerText='Settings'
        direction='down'
        alignment='center' >

        <h6 className='drop__title'>Time</h6>
        <ul className='drop__menu drop__menu--select' role='menu'>
          {dates}
        </ul>
        <h6 className='drop__title'>Resolution</h6>
        <ul className='drop__menu drop__menu--select' role='menu'>
          {resolutions}
        </ul>
        <h6 className='drop__title'>Data Type</h6>
        <ul className='drop__menu drop__menu--select' role='menu'>
          {dataTypes}
        </ul>
      </Dropdown>
    );
  }
});

module.exports = Filters;
