'use strict';
var React = require('react');
var actions = require('../actions/actions');

var ResultsItem = React.createClass({
  render: function() {
    var d = this.props.data;
    var pagination = this.props.pagination;

    var isFirst = pagination.current == 1;
    var isLast = pagination.current == pagination.total;

    return (
      <div>
        <small>{d._id}</small>
        <h1>{d.title}</h1>
        <p>{d.contact}</p>

        <div>Image {pagination.current} of {pagination.total}</div>
        <div><a href="#" onClick={actions.prevResult} className={isFirst ? 'disabled' : ''}>Prev</a> | <a href="#" onClick={actions.nextResult} className={isLast ? 'disabled' : ''}>Next</a></div>
        <div><a href="#" onClick={actions.resultListView}>All</a></div>
      </div>
    );
  }
})

module.exports = ResultsItem;