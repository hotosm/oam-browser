'use strict';
var React = require('react/addons');
var Dropdown = require('./shared/dropdown');

var Filters = module.exports = React.createClass({
  render: function() {
    return (
      <Dropdown element="li" className="drop dropdown center" triggerTitle="Settings" triggerClassName="bttn-settings" triggerText="Settings">
        <dl className="drop-menu filters-options-menu" role="menu">
          <dt className="drop-menu-sectitle">Time</dt>
          <dd className="active"><a href="#" title="All time">All</a></dd>
          <dd><a href="#" title="Last week">Last week</a></dd>
          <dd><a href="#" title="Last month">Last month</a></dd>
          <dd><a href="#" title="Last year">Last year</a></dd>
          <dt className="drop-menu-sectitle">Resolution</dt>
          <dd className="active"><a href="" title="All types">All</a></dd>
          <dd><a href="#" title="Low">Low</a></dd>
          <dd><a href="#" title="Medium">Medium</a></dd>
          <dd><a href="#" title="High">High</a></dd>
        </dl>
      </Dropdown>
    );
  }
});
