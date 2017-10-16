import { hashHistory } from "react-router";
import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import Reflux from "reflux";
import Dropdown from "oam-design-system/dropdown";

import FilterIcon from "mdi-react/FilterVariantIcon";

import actions from "actions/actions";
import searchQueryStore from "stores/search_query_store";
import cookie from "utils/cookie";
import config from "config.js";

export default createReactClass({
  displayName: "Filters",

  propTypes: {
    query: PropTypes.object,
    params: PropTypes.object
  },

  mixins: [Reflux.listenTo(searchQueryStore, "onSearchQuery")],

  getInitialState: function() {
    return {
      date: "all",
      resolution: "all",
      dataType: "all"
    };
  },

  onSearchQuery: function(data) {
    this.setState(data);
  },

  setDate: function(d) {
    actions.setDateFilter(d.key);
    this._updateUrl("date", d.key);
  },

  setResolution: function(d) {
    actions.setResolutionFilter(d.key);
    this._updateUrl("resolution", d.key);
  },

  setDataType: function(d) {
    actions.setDataTypeFilter(d.key);
    this._updateUrl("type", d.key);
  },

  _updateUrl: function(prop, value) {
    var query = this.props.query;
    if (value === "all") {
      delete query[prop];
    } else {
      query[prop] = value;
    }

    var mapView = this.props.params.map.view;
    if (!mapView) {
      var cookieView = cookie.read("oam-map-view");
      if (cookieView !== "undefined") {
        mapView = cookie.read("oam-map-view").replace(/\|/g, ",");
      } else {
        mapView = config.map.initialView
          .concat(config.map.initialZoom)
          .join(",");
      }
    }

    hashHistory.push({ pathname: mapView, query: query });
  },

  render: function() {
    function filterItem(property, clickHandler, d) {
      var klass =
        this.state[property] === d.key ? "drop__menu-item--active" : "";
      var click = clickHandler.bind(this, d);
      return (
        <li key={property + "-filter-" + d.key}>
          <a
            onClick={click}
            title={d.title}
            className={`drop__menu-item ${klass}`}
          >
            {d.title}
          </a>
        </li>
      );
    }

    var dates = [
      { key: "all", title: "All" },
      { key: "week", title: "Last week" },
      { key: "month", title: "Last month" },
      { key: "year", title: "Last year" }
    ].map(filterItem.bind(this, "date", this.setDate));

    var resolutions = [
      { key: "all", title: "All" },
      { key: "low", title: "Low" },
      { key: "medium", title: "Medium" },
      { key: "high", title: "High" }
    ].map(filterItem.bind(this, "resolution", this.setResolution));

    var dataTypes = [
      { key: "all", title: "All Images" },
      { key: "service", title: "Image + Map Layer" }
    ].map(filterItem.bind(this, "dataType", this.setDataType));

    return (
      <span>
        <FilterIcon />
        <Dropdown
          triggerElement="a"
          triggerText=""
          direction="down"
          alignment="center"
        >
          <h6 className="drop__title">Time</h6>
          <ul className="drop__menu drop__menu--select" role="menu">
            {dates}
          </ul>
          <h6 className="drop__title">Resolution</h6>
          <ul className="drop__menu drop__menu--select" role="menu">
            {resolutions}
          </ul>
          <h6 className="drop__title">Data Type</h6>
          <ul className="drop__menu drop__menu--select" role="menu">
            {dataTypes}
          </ul>
        </Dropdown>
      </span>
    );
  }
});
