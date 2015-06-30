'use strict';
var React = require('react/addons');
var Reflux = require('reflux');
var Dropdown = require('./shared/dropdown');
var actions = require('../actions/actions');
var searchQuery = require('../stores/search_query_store');

var Filters = module.exports = React.createClass({
  mixins: [
    Reflux.connect(searchQuery) // calls this.setState() with results of searchQuery store
  ],

  render: function() {
    var dates = [
      {key: 'all', title: 'All'},
      {key: 'week', title: 'Last week'},
      {key: 'month', title: 'Last week'},
      {key: 'year', title: 'Last year'}
    ].map(function (d) {
      var klass = this.state.date === d.key ? 'active' : '';
      var click = actions.setDateFilter.bind(actions, d.key);
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
      var click = actions.setResolutionFilter.bind(actions, d.key);
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
