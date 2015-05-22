'use strict';
var React = require('react');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

var App = React.createClass({
  render: function() {
    return (
      <div>
        <header id="site-header" role="banner">
          <h1 id="site-title"><img src="/assets/graphics/layout/oam-logo-h-pos.svg" width="167" height="32" alt="OpenAerialMap logo" /><span>OpenAerialMap</span></h1>
          <nav id="site-prime-nav" role="navigation">
            <div className="nav-block-prime">
              <form className="search-form">
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
                <li><a href="#" title="About" className="bttn-info"><span>About</span></a></li>
              </ul>
            </div>
          </nav>
        </header>
        <main id="site-body" role="main">
          <RouteHandler />
        </main>
      </div>
    );
  }
});

module.exports = App;