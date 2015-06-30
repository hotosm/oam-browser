'use strict';
var React = require('react/addons');
var Reflux = require('reflux');
var Router = require('react-router');
var Dropdown = require('./shared/dropdown');
var actions = require('../actions/actions');
var searchQuery = require('../stores/search_query_store');

var Filters = module.exports = React.createClass({
  mixins: [
    Reflux.connect(searchQuery), // calls this.setState() with results of searchQuery store
    Router.Navigation,
    Router.State
  ],

  setDate: function (d) {
    actions.setDateFilter(d.key);
    this._updateUrl('date', d.key);
  },

  setResolution: function (d) {
    actions.setResolutionFilter(d.key);
    this._updateUrl('resolution', d.key)
  },

  _updateUrl: function (prop, value) {
    var query = this.getQuery();
    if (value === 'all') {
      delete query[prop]
    } else {
      query[prop] = value;
    }
    var routes = this.getRoutes();
    this.replaceWith(routes[routes.length - 1].name, this.getParams(), query);
  },

  render: function() {
    var dates = [
      {key: 'all', title: 'All'},
      {key: 'week', title: 'Last week'},
      {key: 'month', title: 'Last month'},
      {key: 'year', title: 'Last year'}
    ].map(function (d) {
      var klass = this.state.date === d.key ? 'active' : '';
      var click = this.setDate.bind(this, d);
      return (
        <dd key={'date-filter-' + d.key} className={klass}>
          <a onClick={click} title={d.title}>{d.title}</a>
        </dd>);
    }.bind(this));

    var resolutions = [
      {key: 'all', title: 'All'},
      {key: 'low', title: 'Low'},
      {key: 'medium', title: 'Medium'},
      {key: 'high', title: 'High'}
    ].map(function (d) {
      var klass = this.state.resolution === d.key ? 'active' : '';
      var click = this.setResolution.bind(this, d);
      return (
        <dd key={'resolution-filter-' + d.key} className={klass}>
          <a onClick={click} title={d.title}>{d.title}</a>
        </dd>);
    }.bind(this));

    return (
      <Dropdown element="li" className="drop dropdown center" triggerTitle="Settings" triggerClassName="bttn-settings" triggerText="Settings">
        <dl className="drop-menu filters-options-menu" role="menu">
          <dt className="drop-menu-sectitle">Time</dt>
          {dates}
          <dt className="drop-menu-sectitle">Resolution</dt>
          {resolutions}
        </dl>
      </Dropdown>
    );
  }
});
