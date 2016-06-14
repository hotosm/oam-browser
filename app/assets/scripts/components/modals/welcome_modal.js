'use strict';
import React from 'react';
import Reflux from 'reflux';
import Keys from 'react-keybinding';
import actions from '../../actions/actions';
import OAM from 'oam-design-system';
import { hashHistory } from 'react-router';
import centroid from 'turf-centroid';
import mapStore from '../../stores/map_store';
import utils from '../../utils/utils';

var { Modal, ModalHeader, ModalBody } = OAM.Modal;

var WelcomeModal = React.createClass({
  displayName: 'WelcomeModal',

  propTypes: {
    revealed: React.PropTypes.bool
  },

  mixins: [
    Reflux.listenTo(actions.latestImageryLoaded, 'onLatestImageryLoaded'),
    Reflux.listenTo(actions.openModal, 'onOpenModal'),
    Keys
  ],

  keybindings: {
    'esc': function () {
      this.closeModal();
    }
  },

  getInitialState: function () {
    return {
      revealed: this.props.revealed,
      browseLatestEnabled: false
    };
  },

  onLatestImageryLoaded: function () {
    this.setState({
      browseLatestEnabled: true
    });
  },

  onOpenModal: function (which) {
    return which === 'welcome' && this.openModal();
  },

  closeModal: function () {
    this.setState({ revealed: false });
  },

  openModal: function () {
    this.setState({ revealed: true });
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

    this.closeModal();

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
      this.closeModal();
      actions.geocoderResult(bounds);
    });
  },

  onMyLocationClick: function (e) {
    e.preventDefault();
    this.closeModal();
    actions.requestMyLocation();
  },

  render: function () {
    return (
      <Modal
        id='modal-welcome'
        className='modal--medium'
        onCloseClick={this.closeModal}
        revealed={this.state.revealed} >

        <ModalHeader>
          <div className='modal__headline'>
            <h1 className='modal__title'>Welcome to Open Aerial Map</h1>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className='card'>
            <div className='card__header'>
              <div className='card__headline'>
                <h1 className='card__title'>
                  <img src='assets/graphics/layout/oam-logo-h-neg.svg' width='167' height='32' alt='OpenAerialMap logo' /><span>OpenAerialMap</span>
                </h1>
                <div className='card__subtitle'>Browse the open collection of aerial imagery.</div>
              </div>
            </div>
            <div className='card__body'>
              <div className='inner'>
                <form className='form-search-welcome mod-block' onSubmit={this.onGeocoderSearch}>
                  <div className='form__input-group'>
                    <input className='form__control form__control--large' type='search' placeholder='Search location' ref='geocoder' />
                    {navigator.geolocation ? <a href='#' title='Take me to my location' className='global-search__button-location' onClick={this.onMyLocationClick}><span>My location</span></a> : null}
                    <span className='form__input-group-button'><button className='global-search__button-go button--large' type='submit'><span>Search</span></button></span>
                  </div>
                </form>
                <p className='mod-sep'><span>or</span></p>
                <div className='mod-block'>
                  <a href='#' className={(this.state.browseLatestEnabled ? '' : 'disabled ') + 'bttn-latest-welcome'} onClick={this.onBrowseLatestClick}><span>View latest imagery</span></a>
                </div>
              </div>
            </div>
          </div>

        </ModalBody>
      </Modal>
    );
  }
});

module.exports = WelcomeModal;
