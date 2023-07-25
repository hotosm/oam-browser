import React from "react";
import createReactClass from "create-react-class";

import config from "config";

export default createReactClass({
  displayName: "Status",

  getInitialState: function() {
    return {
      oamHealth: null
    };
  },

  fetchOAMHealth: function() {
    fetch(config.oamStatus)
      .then(response => {
        if (!response.ok)
          return Promise.reject(new Error(`HTTP Error ${response.status}`));
        return response.json();
      })
      .then(data => {
        this.setState({
          oamHealth: data.health
        });
      });
  },

  getOAMHealthClass: function() {
    var oamHealthClass = "drop__menu-item status-item ";
    switch (this.state.oamHealth) {
      case "green":
        oamHealthClass += "status-item--up";
        break;
      case "yellow":
        oamHealthClass += "status-item--meh";
        break;
      case "red":
        oamHealthClass += "status-item--down";
        break;
      default:
        oamHealthClass += "status-item--unknown";
    }
    return oamHealthClass;
  },

  // OAM health endpoint is currently down
  // componentDidMount: function() {
  //   this.fetchOAMHealth();
  // },

  render: function() {
    let oamHealthClass = this.getOAMHealthClass();

    return (
      <a
        href="https://uptime.hotosm.org/"
        className={oamHealthClass}
        title="Go to OAM Status"
      >
        Status
      </a>
    );
  }
});
