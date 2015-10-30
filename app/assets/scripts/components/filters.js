'use strict';
var React = require('react/addons');
var Reflux = require('reflux');
var Router = require('react-router');
var Dropdown = require('./shared/dropdown');
var actions = require('../actions/actions');
var searchQueryStore = require('../stores/search_query_store');
var cookie = require('../utils/cookie');
var config = require('../config.js');

var Filters = React.createClass({
  mixins: [
    Reflux.listenTo(searchQueryStore, 'onSearchQuery'),
    Router.Navigation,
    Router.State
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
    var query = this.getQuery();
    if (value === 'all') {
      delete query[prop];
    } else {
      query[prop] = value;
    }

    var mapView = this.getParams().map;
    if (!mapView) {
      var cookieView = cookie.read('oam-browser:map-view');
      if (cookieView !== 'undefined') {
        mapView = cookie.read('oam-browser:map-view');
      } else {
        mapView = config.map.initialView.concat(config.map.initialZoom).join(',');
      }
    }

    this.transitionTo('map', {map: mapView}, query);
  },

  render: function () {
    function filterItem (property, clickHandler, d) {
      var klass = this.state[property] === d.key ? 'active' : '';
      var click = clickHandler.bind(this, d);
      return (
        <dd key={property + '-filter-' + d.key} className={klass}>
          <a onClick={click} title={d.title}>{d.title}</a>
        </dd>);
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
      <Dropdown element='li' className='drop dropdown center' triggerTitle='Settings' triggerClassName='bttn-settings' triggerText='Settings'>
        <dl className='drop-menu filters-options-menu' role='menu'>
          <dt className='drop-menu-sectitle'>Time</dt>
          {dates}
          <dt className='drop-menu-sectitle'>Resolution</dt>
          {resolutions}
          <dt className='drop-menu-sectitle'>Data Type</dt>
          {dataTypes}
        </dl>
      </Dropdown>
    );
  }
});

module.exports = Filters;
