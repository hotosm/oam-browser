'use strict';
import { hashHistory } from 'react-router';
import React from 'react';
import Reflux from 'reflux';
import centroid from 'turf-centroid';
import BModal from './base_modal';
import actions from '../../actions/actions';
import mapStore from '../../stores/map_store';
import utils from '../../utils/utils';

var WelcomeModal = React.createClass({
  displayName: 'WelcomeModal',

  propTypes: {
    revealed: React.PropTypes.bool
  },

  mixins: [
    Reflux.listenTo(actions.latestImageryLoaded, 'onLatestImageryLoaded')
  ],

  getInitialState: function () {
    return {
      browseLatestEnabled: false
    };
  },

  onLatestImageryLoaded: function () {
    this.setState({
      browseLatestEnabled: true
    });
  },

  onBrowseLatestClick: function (e) {
    e.preventDefault();
    console.groupCollapsed('onBrowseLatestClick');
    var previewZoom = 10;
    var latest = mapStore.getLatestImagery();
    var f = {
      type: 'Feature',
      geometry: latest.geojson
    };
    var center = centroid(f).geometry.coordinates;
    var quadKey = utils.quadkeyFromCoords(center[0], center[1], previewZoom);
    var mapView = center[0] + ',' + center[1] + ',' + previewZoom;

    console.log('Feature', f);
    console.log('coords center', center);
    console.log('quadKey', quadKey);
    console.log('full url -- %s/%s/%s', mapView, quadKey, latest._id);

    this.refs.base.closeModal();

    hashHistory.push(`/${mapView}/${quadKey}/${latest._id}`);

    console.groupEnd('onBrowseLatestClick');
  },

  onGeocoderSearch: function (e) {
    e.preventDefault();

    var queryString = this.refs.geocoder.value;

    utils.queryGeocoder(queryString, bounds => {
      if (!bounds) {
        console.log('geocoder -- no result was found');
        return;
      }
      this.refs.base.closeModal();
      actions.geocoderResult(bounds);
    });
  },

  onMyLocationClick: function (e) {
    e.preventDefault();
    this.refs.base.closeModal();
    actions.requestMyLocation();
  },

  getHeader: function () {
    return (
      <div>
        <h1 id='modal-title'><img src='assets/graphics/layout/oam-logo-h-neg.svg' width='167' height='32' alt='OpenAerialMap logo' /><span>OpenAerialMap</span></h1>
        <p>Browse the open collection of aerial imagery.</p>
      </div>
    );
  },

  getBody: function () {
    return (
      <div>
        <form className='form-search-welcome mod-block' onSubmit={this.onGeocoderSearch}>
          <div className='input-group'>
            <input className='form-control input-l input search' type='search' placeholder='Search location' ref='geocoder'/>
            {navigator.geolocation ? <a href='#' title='Take me to my location' className='bttn-my-location' onClick={this.onMyLocationClick}><span>My location</span></a> : null}
            <span className='input-group-bttn'><button type='submit' className='bttn-search-welcome'><span>Search</span></button></span>
          </div>
        </form>
        <p className='mod-sep'><span>or</span></p>
        <div className='mod-block'>
          <a href='#' className={(this.state.browseLatestEnabled ? '' : 'disabled ') + 'bttn-latest-welcome'} onClick={this.onBrowseLatestClick}><span>View latest imagery</span></a>
        </div>
      </div>
    );
  },

  getFooter: function () {
    return false;
  },

  render: function () {
    return (
      <BModal
        ref='base'
        type='welcome'
        header={this.getHeader()}
        body={this.getBody()}
        footer={this.getFooter()}
        revealed={this.props.revealed} />
    );
  }
});

module.exports = WelcomeModal;
