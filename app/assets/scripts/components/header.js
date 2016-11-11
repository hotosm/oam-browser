'use strict';
import React from 'react';
import Keys from 'react-keybinding';
import $ from 'jquery';
import { Dropdown } from 'oam-design-system';
import actions from '../actions/actions';
import Filters from './filters';
import utils from '../utils/utils';
import { hashHistory } from 'react-router';
import config from '../config';
import centroid from 'turf-centroid';
import mapStore from '../stores/map_store';
import MapLayers from './map-layers';

var Header = React.createClass({
  displayName: 'Header',

  propTypes: {
    query: React.PropTypes.object,
    params: React.PropTypes.object
  },

  mixins: [
    Keys
  ],

  keybindings: {
    'i': function () {
      actions.openModal('info');
    },
    's': function () {
      // By delaying the focus some millis we prevent the 's' from being
      // typed in the search box.
      setTimeout(() => this.refs.geocoder.focus(), 10);
    }
  },

  getInitialState: function () {
    return {
      'oamHealth': null
    };
  },

  fetchOAMHealth: function () {
    var _this = this;
    $.get(config.oamStatus)
      .success(function (data) {
        _this.setState({
          'oamHealth': data.health
        });
      });
  },

  feedbackClickHandler: function (e) {
    e.preventDefault();
    actions.openModal('feedback');
  },

  onGeocoderSearch: function (e) {
    e.preventDefault();

    var queryString = this.refs.geocoder.getDOMNode().value;
    utils.queryGeocoder(queryString, bounds => {
      if (!bounds) {
        console.log('geocoder -- no result was found');
        return;
      }
      actions.geocoderResult(bounds);
    });
  },

  onMyLocationClick: function (e) {
    e.preventDefault();
    actions.requestMyLocation();
  },

  componentDidMount: function () {
    this.fetchOAMHealth();
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

    hashHistory.push(`/${mapView}/${quadKey}/${latest._id}`);

    console.groupEnd('onBrowseLatestClick');
  },

  render: function () {
    var oamHealthClass = 'drop__menu-item status-item ';
    switch (this.state.oamHealth) {
      case 'green':
        oamHealthClass += 'status-item--up';
        break;
      case 'yellow':
        oamHealthClass += 'status-item--meh';
        break;
      case 'red':
        oamHealthClass += 'status-item--down';
        break;
      default:
        oamHealthClass += 'status-item--unknown';
    }

    return (
      <header className='page__header' role='banner'>
        <div className='inner'>
          <div className='page__headline'>
            <h1 className='page__title'>
                <span className='mast-logo mast-logo--h'>
                  <a href='https://openaerialmap.org/' title='Visit homepage'><img className='mast-logo__image' src='assets/graphics/layout/oam-logo-h-pos.svg' width='832' height='160' alt='OpenAerialMap logo' />
                  <strong className='mast-logo__text'>OpenAerialMap</strong></a>
                  <small className='mast-logo__label'>Browser</small>
                </span>
            </h1>
          </div>

          <nav className='page__prime-nav' role='navigation'>
            <div className='nav-block-prime'>
              <form className='form global-search' onSubmit={this.onGeocoderSearch}>
                <div className='form__group'>
                  <label className='form__label' htmlFor='global-search__input'>Search</label>
                  <div className='form__input-group'>
                    <input className='form__control form__control--medium' id='global-search__input' type='search' placeholder='Search location' ref='geocoder' />
                    {navigator.geolocation ? <a href='#' title='Take me to my location' className='global-search__button-location' onClick={this.onMyLocationClick}><span>My location</span></a> : null}
                    <span className='form__input-group-button'><button className='global-search__button-go' type='submit'><span>Search</span></button></span>
                  </div>
                </div>
              </form>
              <ul className='app-menu'>
                <li>
                  <Filters
                    params={this.props.params}
                    query={this.props.query} />
                </li>
                <li>
                  <a href='#' onClick={this.onBrowseLatestClick} className='button-latest' title='Go to the latest imagery'><span>Latest imagery</span></a>
                </li>
                <li className='map-layers'>
                  <MapLayers />
                </li>
              </ul>
            </div>
            <div className='nav-block-sec'>
              <ul className='meta-menu'>
                <li><a href='https://upload.openaerialmap.org/' className='button-upload' title='Go to OAM Uploader'><span>Upload</span></a></li>
                <li>
                  <Dropdown
                    triggerElement='a'
                    triggerClassName='button-info'
                    triggerActiveClassName='button--active'
                    triggerTitle='Info'
                    triggerText='Info'
                    direction='down'
                    alignment='right'>
                    <ul className='drop__menu info-menu' role='menu'>
                      <li><a className='drop__menu-item' href='http://openaerialmap.org/about' title='Learn more' data-hook='dropdown:close'><span>About</span></a></li>
                      <li><a className='drop__menu-item' href='http://docs.openaerialmap.org/browser/getting-started/' title='Go to User Guide'><span>Help</span></a></li>
                      <li><a className='drop__menu-item' href='#modal-feedback' title='Leave feedback' data-hook='dropdown:close' onClick={this.feedbackClickHandler}><span>Feedback</span></a></li>
                      <li><a className='drop__menu-item' href='mailto:info@openaerialmap.org' title='Get in touch'><span>Contact</span> <small>info@openaerialmap.org</small></a></li>
                    </ul>
                    <ul className='drop__menu info-menu' role='menu'>
                      <li><a href='https://status.openaerialmap.org/' className={oamHealthClass} title='Go to OAM Status'><span>Status</span></a></li>
                    </ul>
                  </Dropdown>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </header>
    );
  }
});

module.exports = Header;
