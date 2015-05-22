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
        <article className="card card-result-entry">
          <a href="#" onClick={this.onClick} onMouseOver={this.onOver} onMouseOut={this.onOut}>
            <h1 className="card-title">{d.title}</h1>
            <div className="card-media">
              <img src={'http://lorempixel.com/600/400/?v=' + d._id} alt=""/>
            </div>
            <div className="card-body">
              <dl className="card-details">
                <dd>Term 1</dd>
                <dt>Value 1</dt>
                <dd>Term 2</dd>
                <dt>Value 2</dt>
                <dd>Term 3</dd>
                <dt>Value 3</dt>
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
      <section className="results-hub">
        <header className="pane-header">
          <h1 className="pane-title">Selection</h1>
          <p className="pane-subtitle">{numRes} results</p>
        </header>
        <div className="pane-body">
          <ol className="results-list">{results}</ol>
        </div>
        <footer className="pane-footer"></footer>
      </section>
    );
  }
});

module.exports = ResultsList;