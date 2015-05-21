'use strict';
var React = require('react');
var actions = require('../actions/actions');

var ResultsListItem = React.createClass({
  render: function() {
    var d = this.props.data;

    return (
      <li>
        <a href="#" title="image" onClick={actions.resultOpen.bind(actions, d)} onMouseOver={actions.resultOver.bind(actions, d)} onMouseOut={actions.resultOut.bind(actions, d)} >{d.title}</a>
      </li>
    );
  }
})

var ResultsList = React.createClass({
  render: function() {
    var r = this.props.results.map(function(o) {
      return (<ResultsListItem key={o._id} data={o} />);
    });
    return (
      <ul>{r}</ul>
    );
  }
});

module.exports = ResultsList;