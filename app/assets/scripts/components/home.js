'use strict';
var React = require('react/addons');
var Reflux = require('reflux');
var Router = require('react-router');
var _ = require('lodash');
var MapBoxMap = require('./map');
var MiniMap = require('./minimap');
var ResultsPane = require('./results_pane');
var mapStore = require('../stores/map_store');
var searchQueryStore = require('../stores/search_query_store');

var Home = React.createClass({
  mixins: [
    Reflux.listenTo(searchQueryStore, 'onSearchQueryChanged'),
    Reflux.listenTo(mapStore, "onResults"),
    Router.Navigation,
    Router.State
  ],

  getInitialState: function() {
    return {
      results: [],
      map: {
        styleProperty: 'all_all_all_count'
      }
    }
  },

  onResults: function(results) {
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    console.log('Home controller', 'onResults', results);
    console.log('onResults router', this.getParams());
    this.setState({
      results: results,
    });
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
  },

  // Action listener
  onSearchQueryChanged: function(params) {
    console.log('home onSearchQueryChanged');
    var mapState = _.clone(this.state.map);
    mapState.styleProperty = params.date + '_' + params.resolution + '_' + params.dataType + '_count';
    console.log('changing map style', mapState.styleProperty);
    this.setState({map: mapState});
  },

  render: function() {
    return (
      <div>
        <MapBoxMap {...this.props} styleProperty={this.state.map.styleProperty  } />
        {/*<MiniMap />*/}
        <ResultsPane results={this.state.results} selectedItem={this.props.params.item_id} selectedSquare={this.props.params.square}/>
      </div>
    );
  }
});

module.exports = Home;