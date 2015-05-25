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
            <header className="card-header">
              <h1 className="card-title">{d.title}</h1>
              <div className="card-media">
                <img src={'http://lorempixel.com/600/400/?v=' + d._id} alt=""/>
              </div>
            </header>
            <div className="card-body">
              <dl className="card-details">
                <dt>Type</dt>
                <dd>Multiscene TMS</dd>
                <dt>Date</dt>
                <dd>2015-05-18</dd>
                <dt>Res</dt>
                <dd>50 cm</dd>
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
          <div className="pane-body-inner">
            <ol className="results-list">{results}</ol>
          </div>
        </div>
        <footer className="pane-footer"></footer>
      </section>
    );
  }
});

module.exports = ResultsList;