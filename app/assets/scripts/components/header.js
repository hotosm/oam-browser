'use strict';
var React = require('react/addons');
var Keys = require('react-keybinding');
var $ = require('jquery');
var Dropdown = require('./shared/dropdown');
var actions = require('../actions/actions');
var Filters = require('./filters');
var utils = require('../utils/utils');
var config = require('../config');

var Header = React.createClass({
  displayName: 'Header',

  mixins: [
    Keys
  ],

  keybindings: {
    'i': function () {
      actions.openModal('info');
    },
    's': function () {
      var geocoder = this.refs.geocoder.getDOMNode();
      geocoder.focus();
      // Prevent the 's' from being typed in the search box.
      setTimeout(function () {
        geocoder.value = '';
      }, 1);
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

  aboutClickHandler: function (e) {
    e.preventDefault();
    actions.openModal('info');
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

  render: function () {
    var oamHealthClass = 'status-item ';
    switch (this.state.oamHealth) {
      case 'green':
        oamHealthClass += 'status-up';
        break;
      case 'yellow':
        oamHealthClass += 'status-meh';
        break;
      case 'red':
        oamHealthClass += 'status-down';
        break;
      default:
        oamHealthClass += 'status-unknown';
    }

    return (
      <header id='site-header' role='banner'>
      <h1 id='site-title'><img src='assets/graphics/layout/oam-logo-h-pos.svg' width='167' height='32' alt='OpenAerialMap logo' /><span>OpenAerialMap</span> <small>Browser</small></h1>
        <nav id='site-prime-nav' role='navigation'>
          <div className='nav-block-prime'>
            <form className='form-search' onSubmit={this.onGeocoderSearch}>
              <div className='input-group'>
                <input className='form-control input-m input search' type='search' placeholder='Search location' ref='geocoder' />
                {navigator.geolocation ? <a href='#' title='Take me to my location' className='bttn-my-location' onClick={this.onMyLocationClick}><span>My location</span></a> : null}
                <span className='input-group-bttn'><button type='submit' className='bttn-search'><span>Search</span></button></span>
              </div>
            </form>
            <ul className='app-menu'>
              <Filters />
            </ul>
          </div>
          <div className='nav-block-sec'>
            <ul className='meta-menu'>
              <li><a href='https://upload.openaerialmap.org/' className='bttn-upload' title='Go to OAM Uploader'><span>Upload</span></a></li>
              <Dropdown element='li' className='drop dropdown right' triggerTitle='Info' triggerClassName='bttn-info' triggerText='Info'>
                <ul className='drop-menu info-menu' role='menu'>
                  <li><a href='#modal-info' title='Learn more' onClick={this.aboutClickHandler}><span>About</span></a></li>
                  <li><a href='https://github.com/hotosm/oam-browser/blob/develop/docs/user-guide.md' title='Go to User Guide'><span>Help</span></a></li>
                  <li><a href='mailto:info@openaerialmap.org' title='Get in touch'><span>Contact</span> <small>info@openaerialmap.org</small></a></li>
                  <li className='sep'><a href='https://status.openaerialmap.org/' className={oamHealthClass} title='Go to OAM Status'><span>Status</span></a></li>
                </ul>
              </Dropdown>
            </ul>
          </div>
        </nav>
      </header>
    );
  }
});

module.exports = Header;
