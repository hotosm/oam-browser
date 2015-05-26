'use strict';

var React = require('react/addons');
var Reflux = require('reflux');
var BModal = require('./base_modal');

var WelcomeModal = React.createClass({
  getHeader: function() {
    return (
      <div>
        <h1 id="modal-title"><img src="/assets/graphics/layout/oam-logo-h-neg.svg" width="167" height="32" alt="OpenAerialMap logo" /><span>OpenAerialMap</span></h1>
        <p>Welcome to the open collection of aerial imagery.</p>
      </div>
    );
  },

  getBody: function() {
    return (
      <div>
        <form className="form-search-welcome mod-block">
          <div className="input-group">
            <input className="form-control input-l input search" type="search" placeholder="Search location" />
            <span className="input-group-bttn"><button type="submit" className="bttn-search-welcome"><span>Search</span></button></span>
          </div>
        </form>
        <p className="mod-sep"><span>or</span></p>
        <div className="mod-block">
          <a href="" className="bttn-latest-welcome"><span>Browse latest imagery</span></a>
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