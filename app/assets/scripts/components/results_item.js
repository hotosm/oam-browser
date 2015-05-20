'use strict';
var React = require('react');

var ResultsItem = React.createClass({
  render: function() {
    var d = this.props.data;

    return (
      <div>
        <small>{d._id}</small>
        <h1>{d.title}</h1>
        <p>{d.contact}</p>
      </div>
    );
  }
})

module.exports = ResultsItem;