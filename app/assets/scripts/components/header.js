'use strict';
var React = require('react/addons');
var Modal = require('./modal');
var actions = require('../actions/actions');

var Header = React.createClass({

  aboutClickHandler: function(e) {
    e.preventDefault();
    actions.openModal('info');
  },

  render: function() {
    return (
      <header id="site-header" role="banner">
        <h1 id="site-title"><img src="/assets/graphics/layout/oam-logo-h-pos.svg" width="167" height="32" alt="OpenAerialMap logo" /><span>OpenAerialMap</span></h1>
        <nav id="site-prime-nav" role="navigation">
          <div className="nav-block-prime">
            <form className="form-search">
              <input type="search" placeholder="Search location" className="input-search" />
              <button type="submit" className="bttn-search"><span>Search</span></button>
              <button type="button" className="bttn-mylocation"><span>My location</span></button>
            </form>
            <ul className="app-menu">
              <li className="drop dropdown center">
                <a href="#" title="Settings" className="bttn-settings" data-toggle="drop"><span>Settings</span></a>
                <div className="drop-content">
                  <p>Settings go here.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="nav-block-sec">
            <ul className="meta-menu">
              <li><a href="#" title="About" className="bttn-info" onClick={this.aboutClickHandler} ><span>About</span></a></li>
            </ul>
          </div>
        </nav>
      </header>
    );
  }
});

module.exports = Header;
