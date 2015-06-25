'use strict';
var React = require('react/addons');
var actions = require('../actions/actions');
var utils = require('../utils/utils');
var mapStore = require('../stores/map_store');

var ResultsListItem = React.createClass({

  onClick: function(e) {
    e.preventDefault();
    actions.resultItemSelect(this.props.data);
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
                <img alt="Result thumbnail" width="768" height="432" src={d.properties.thumbnail || "assets/graphics/layout/img-placeholder.svg" } />
              </div>
            </header>
            <div className="card-body">
              <dl className="card-details">
                <dt>Type</dt>
                <dd>{d.properties.tms ? 'Image + Tiled Map' : 'Image'}</dd>
                <dt>Date</dt>
                <dd>{d.acquisition_start.slice(0,10)}</dd>
                <dt>Res</dt>
                <dd>{utils.gsdToUnit(d.gsd)}</dd>
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
    var square = mapStore.getSelectedSquareCenter();
    var north = Math.round(square[1] * 100000) / 100000;
    var east = Math.round(square[0] * 100000) / 100000;

    var numRes = this.props.results.length;
    var results = this.props.results.map(function(o) {
      return (<ResultsListItem key={o._id} data={o} />);
    });
    return (
      <section className="results-hub">
        <header className="pane-header">
          <h1 className="pane-title" title={'N ' + square[1] + ', E ' + square[0]}>{'N ' + north + ', E ' + east}</h1>
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