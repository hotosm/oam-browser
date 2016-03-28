'use strict';
var React = require('react/addons');
var Keys = require('react-keybinding');
var Dropdown = require('./shared/dropdown');
var actions = require('../actions/actions');
var Filters = require('./filters');
var utils = require('../utils/utils');

var Header = React.createClass({
  mixins: [
    Keys
  ],

  keybindings: {
    'i': function () {
      actions.openModal('info');
    },
    's': function () {
      var geocoder = this.getDOMNode().querySelector('[data-hook="geocoder"]');
      geocoder.focus();
      // Prevent the 's' from being typed in the search box.
      setTimeout(function () {
        geocoder.value = '';
      }, 1);
    }
  },

  aboutClickHandler: function (e) {
    e.preventDefault();
    actions.openModal('info');
  },

  onGeocoderSearch: function (e) {
    e.preventDefault();

    var queryString = this.getDOMNode().querySelector('[data-hook="geocoder"]').value;
    utils.queryGeocoder(queryString, function (bounds) {
      if (!bounds) {
        console.log('geocoder -- no result was found');
        return;
      }
      actions.geocoderResult(bounds);
    });
  },

  render: function () {
    return (
      <header id='site-header' role='banner'>
      <h1 id='site-title'><img src='assets/graphics/layout/oam-logo-h-pos.svg' width='167' height='32' alt='OpenAerialMap logo' /><span>OpenAerialMap</span> <small>Browser</small></h1>
        <nav id='site-prime-nav' role='navigation'>
          <div className='nav-block-prime'>
            <form className='form-search' onSubmit={this.onGeocoderSearch}>
              <div className='input-group'>
                <input className='form-control input-m input search' type='search' placeholder='Search location' data-hook='geocoder' />
                <span className='input-group-bttn'><button type='submit' className='bttn-search'><span>Search</span></button></span>
              </div>
            </form>
            <ul className='app-menu'>
              <Filters />
            </ul>
          </div>
          <div className='nav-block-sec'>
            <ul className='meta-menu'>
              <li><a href='https://upload.openaerialmap.org/' className='bttn-upload' title='Go to OAM Upload'><span>Upload</span></a></li>
              <Dropdown element='li' className='drop dropdown right' triggerTitle='Info' triggerClassName='bttn-info' triggerText='Info'>
                <ul className='drop-menu info-menu' role='menu'>
                  <li><a href='#' title='Learn more' onClick={this.aboutClickHandler}><span>About</span></a></li>
                  <li><a href='https://status.openaerialmap.org/' title='Go to OAM Status'><span>Status</span></a></li>
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
