'use strict';
import { hashHistory } from 'react-router';
import React from 'react';
import actions from '../actions/actions';
import utils from '../utils/utils';

var ResultsListItem = React.createClass({
  displayName: 'ResultsListItem',

  propTypes: {
    query: React.PropTypes.object,
    mapView: React.PropTypes.string,
    selectedSquareQuadkey: React.PropTypes.string,
    data: React.PropTypes.object
  },

  onClick: function (e) {
    e.preventDefault();
    actions.resultOut(this.props.data);

    let { mapView, selectedSquareQuadkey } = this.props;
    let path = `${mapView}/${selectedSquareQuadkey}/${this.props.data._id}`;
    hashHistory.push({pathname: path, query: this.props.query});
  },

  onOver: function (e) {
    e.preventDefault();
    actions.resultOver(this.props.data);
  },

  onOut: function (e) {
    e.preventDefault();
    actions.resultOut(this.props.data);
  },

  render: function () {
    var d = this.props.data;

    return (
      <li>
        <article className='card card-result-entry'>
          <a href='#' onClick={this.onClick} onMouseOver={this.onOver} onMouseOut={this.onOut}>
            <header className='card-header'>
              <h1 className='card-title'>{d.title}</h1>
              <div className='card-media'>
                <img alt='Result thumbnail' width='768' height='432' src={d.properties.thumbnail || 'assets/graphics/layout/img-placeholder.svg' } />
              </div>
            </header>
            <div className='card-body'>
              <dl className='card-details'>
                <dt>Type</dt>
                <dd>{d.properties.tms ? 'Image + Map Layer' : 'Image'}</dd>
                <dt>Date</dt>
                <dd>{d.acquisition_start ? d.acquisition_start.slice(0, 10) : 'N/A'}</dd>
                <dt>Res</dt>
                <dd>{utils.gsdToUnit(d.gsd)}</dd>
              </dl>
            </div>
          </a>
        </article>
      </li>
    );
  }
});

var ResultsList = React.createClass({
  displayName: 'ResultsList',

  propTypes: {
    query: React.PropTypes.object,
    mapView: React.PropTypes.string,
    selectedSquareQuadkey: React.PropTypes.string,
    results: React.PropTypes.array
  },

  render: function () {
    var square = this.props.selectedSquareQuadkey;

    var numRes = this.props.results.length;
    var results = this.props.results.map(o => {
      return <ResultsListItem
        key={o._id}
        query={this.props.query}
        mapView={this.props.mapView}
        selectedSquareQuadkey={this.props.selectedSquareQuadkey}
        data={o} />;
    });

    return (
      <section className='results-hub'>
        <header className='pane-header'>
          <h1 className='pane-title' title={'Available imagery for square with quadKey ' + square}>Available Imagery</h1>
          <p className='pane-subtitle'>{numRes} results</p>
        </header>
        <div className='pane-body'>
          <div className='pane-body-inner'>
            <ol className='results-list'>{results}</ol>
          </div>
        </div>
        <footer className='pane-footer'></footer>
      </section>
    );
  }
});

module.exports = ResultsList;
