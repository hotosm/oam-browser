'use strict';
var React = require('react');
var actions = require('../actions/actions');

var ResultsListItem = React.createClass({
  onClick: function(e) {
    e.preventDefault();
    actions.resultItemView(this.props.data);
  },
  onOver: function(e) {
    e.preventDefault();
    actions.resultOver(this.props.data);
  },
  onOut: function(e) {
    e.preventDefault();
    actions.resultOut(this.props.data);
  },

  render: function() {
    var d = this.props.data;

    return (
      <li>
        <article>
          <a href="#" onClick={this.onClick} onMouseOver={this.onOver} onMouseOut={this.onOut}>
            <h1>{d.title}</h1>
            <div className="media">
              <img src={'http://lorempixel.com/600/400/?v=' + d._id} alt=""/>
            </div>
            <div>
              <dl>
                <dd>Term</dd>
                <dt>Value</dt>
              </dl>
            </div>
          </a>
        </article>
      </li>
    );
  }
})

var ResultsList = React.createClass({
  render: function() {
    var numRes = this.props.results.length;
    var results = this.props.results.map(function(o) {
      return (<ResultsListItem key={o._id} data={o} />);
    });
    return (
      <section className="results-list">
        <header>
          <h1>Selection</h1>
          <p>{numRes} results</p>
        </header>
        <div>
          <ol>{results}</ol>
        </div>
        <footer></footer>
      </section>
    );
  }
});

module.exports = ResultsList;