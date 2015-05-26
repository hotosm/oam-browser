'use strict';

var React = require('react/addons');
var Reflux = require('reflux');
var BModal = require('./base_modal');
var actions = require('../../actions/actions');

var WelcomeModal = React.createClass({
  mixins: [Reflux.listenTo(actions.latestImageryLoaded, "onLatestImageryLoaded")],

  getInitialState: function() {
    return {
      browseLatestEnabled: false
    };
  },

  onLatestImageryLoaded: function() {
    this.setState({
      browseLatestEnabled: true,
    });
  },

  onBrowseLatestClick: function(e) {
    e.preventDefault();
    actions.goToLatest();
    // Simulate close click.
    this.getDOMNode().querySelector('.dismiss-modal .close').click();
  },

  onGeocoderSearch: function(e) {
    e.preventDefault();
    var _this = this;

    var geocoder = L.mapbox.geocoder('mapbox.places');

    var queryString = this.getDOMNode().querySelector('[data-hook="geocoder"]').value;
    geocoder.query(queryString, function(err, data) {
      actions.geocoderResult(data.lbounds ? data.lbounds : false);
      // Simulate close click.
      _this.getDOMNode().querySelector('.dismiss-modal .close').click();
    });
  },

  getHeader: function() {
    return (
      <div>
        <h1 id="modal-title"><img src="assets/graphics/layout/oam-logo-h-neg.svg" width="167" height="32" alt="OpenAerialMap logo" /><span>OpenAerialMap</span></h1>
        <p>Welcome to the open collection of aerial imagery.</p>
      </div>
    );
  },

  getBody: function() {
    return (
      <div>
        <form className="form-search-welcome mod-block" onSubmit={this.onGeocoderSearch}>
          <div className="input-group">
            <input className="form-control input-l input search" type="search" placeholder="Search location" data-hook="geocoder"/>
            <span className="input-group-bttn"><button type="submit" className="bttn-search-welcome"><span>Search</span></button></span>
          </div>
        </form>
        <p className="mod-sep"><span>or</span></p>
        <div className="mod-block">
          <a href="#" className={(this.state.browseLatestEnabled ? '' : 'disabled ') + 'bttn-latest-welcome'} onClick={this.onBrowseLatestClick}><span>Browse latest imagery</span></a>
        </div>
      </div>
    );
  },

  getFooter: function() {
    return false;
  },

  render: function () {
    return (
      <BModal
        type="welcome"
        header={this.getHeader()}
        body={this.getBody()}
        footer={this.getFooter()}
        revealed={true} />
    );
  }
});

module.exports = WelcomeModal;  