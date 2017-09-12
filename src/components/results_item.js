import React from "react";
import createReactClass from "create-react-class";
import PropTypes from "prop-types";
import qs from "querystring";
import centroid from "turf-centroid";
import Keys from "react-keybinding";
import Dropdown from "oam-design-system/dropdown";
import prettyBytes from "pretty-bytes";

import actions from "actions/actions";
import ZcButton from "components/shared/zc_button";
import utils from "utils/utils";

export default createReactClass({
  displayName: "ResultsItem",

  propTypes: {
    query: PropTypes.object,
    params: PropTypes.object,
    map: PropTypes.object,
    selectedSquareQuadkey: PropTypes.string,
    pagination: PropTypes.object,
    data: PropTypes.object
  },

  mixins: [Keys],

  keybindings: {
    "arrow-left": function() {
      if (this.props.pagination.prevId) {
        this.prevResult(null);
      }
    },
    "arrow-right": function() {
      if (this.props.pagination.nextId) {
        this.nextResult(null);
      }
    }
  },

  getInitialState: function() {
    return {
      selectedPreview: "thumbnail"
    };
  },

  onPreviewSelect: function(what) {
    let selected = what.type;
    if (what.index !== undefined) {
      selected += `-${what.index}`;
      // Clicking again in a custom tms will de-select it, defaulting to none.
      if (selected === this.state.selectedPreview) {
        what = { type: "none" };
        selected = "none";
      }
    }
    actions.selectPreview(what);
    this.setState({ selectedPreview: selected });
  },

  prevResult: function() {
    utils.pushURI(this.props, {
      image: this.props.pagination.prevId
    });
  },

  viewAllResults: function(e) {
    utils.pushURI(this.props, {
      image: null
    });
  },

  nextResult: function(e) {
    utils.pushURI(this.props, {
      image: this.props.pagination.nextId
    });
  },

  onCopy: function(key, trigger) {
    // Close the dropdown.
    this.refs[`tms-drop-${key}`].close();
    // Return the copy text.
    return this.refs[`tms-url-${key}`].value;
  },

  onOpenJosm: function(dropKey, tmsUrl) {
    // Close the dropdown.
    this.refs[`tms-drop-${dropKey}`].close();

    var d = this.props.data;
    var source = "OpenAerialMap - " + d.provider + " - " + d.uuid;
    var urlPrefix =
      document.location.protocol === "https:"
        ? "https://127.0.0.1:8112"
        : "http://127.0.0.1:8111";
    // Reference:
    // http://josm.openstreetmap.de/wiki/Help/Preferences/RemoteControl#load_and_zoom
    fetch(
      urlPrefix +
        "/load_and_zoom?" +
        qs.stringify({
          left: d.bbox[0],
          right: d.bbox[2],
          bottom: d.bbox[1],
          top: d.bbox[3],
          source: source
        })
    )
      .then(response => {
        if (!response.ok)
          return Promise.reject(new Error(`HTTP Error ${response.status}`));
        return response.json();
      })
      .then(function(data) {
        // Reference:
        // http://josm.openstreetmap.de/wiki/Help/Preferences/RemoteControl#imagery
        // Note: `url` needs to be the last parameter.
        fetch(
          urlPrefix +
            "/imagery?" +
            qs.stringify({
              type: "tms",
              title: source
            }) +
            "&url=" +
            tmsUrl
        )
          .then(response => {
            if (!response.ok)
              return Promise.reject(new Error(`HTTP Error ${response.status}`));
            return response.json();
          })
          .success(function() {
            // all good!
            actions.openModal("message", {
              title: "Success",
              message: <p>This scene has been loaded into JOSM.</p>
            });
          });
      })
      .catch(function(err) {
        console.error(err);
        actions.openModal("message", {
          title: "Error",
          message: (
            <div>
              <p>Could not connect to JOSM via Remote Control.</p>
              <p>
                Is JOSM configured to allow
                <a
                  href="https://josm.openstreetmap.de/wiki/Help/Preferences/RemoteControl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  remote control
                </a>?
              </p>
            </div>
          )
        });
      });
  },

  renderCopyWMTS: function(dropdownKey) {
    var wmts = this.props.data.properties.wmts;
    if (!wmts) {
      return null;
    }

    var onCopy = () => {
      this.refs[`tms-drop-${dropdownKey}`].close();
      return wmts;
    };

    return (
      <ul
        className="drop__menu drop__menu--iconified tms-options-menu"
        role="menu"
      >
        <li>
          <ZcButton
            onCopy={onCopy}
            title="Copy WMTS url"
            text="Copy WMTS url"
          />
        </li>
      </ul>
    );
  },

  renderTmsOptions: function(
    tmsUrl,
    key,
    direction,
    aligment,
    includeMainWMTS
  ) {
    var d = this.props.data;
    // Generate the iD URL:
    // grab centroid of the footprint
    var center = centroid(d.geojson).geometry.coordinates;
    // cheat by using current zoom level
    var zoom = this.props.map.view.split(",")[2];
    var idUrl =
      "http://www.openstreetmap.org/edit?editor=id" +
      "#map=" +
      [zoom, center[1], center[0]].join("/") +
      "&" +
      qs.stringify({
        background: "custom:" + tmsUrl
      });

    let prevSelectClass =
      this.state.selectedPreview === `tms-${key}` ? "button--active" : "";

    return (
      <div className="form__group">
        <label className="form__label" htmlFor="tms-url">
          TMS url
        </label>
        <div className="form__input-group">
          <input
            className="form__control form__control--medium"
            type="text"
            value={tmsUrl}
            readOnly
            ref={`tms-url-${key}`}
          />
          <span className="form__input-group-button">
            <Dropdown
              className="drop__content--tms-options"
              triggerElement="button"
              triggerClassName="button-tms-options"
              triggerActiveClassName="button--active"
              triggerTitle="Show options"
              triggerText="Options"
              direction={direction}
              alignment={aligment}
              ref={`tms-drop-${key}`}
            >
              <ul
                className="drop__menu drop__menu--iconified tms-options-menu"
                role="menu"
              >
                <li>
                  <a
                    className="drop__menu-item ide"
                    href={idUrl}
                    target="_blank"
                    title="Open with iD editor"
                  >
                    Open with iD editor
                  </a>
                </li>
                <li>
                  <a
                    className="drop__menu-item josm"
                    onClick={this.onOpenJosm.bind(null, key, tmsUrl)}
                    title="Open with JOSM"
                  >
                    Open with JOSM
                  </a>
                </li>
                <li>
                  <ZcButton
                    onCopy={this.onCopy.bind(null, key)}
                    title="Copy TMS url"
                    text="Copy TMS url"
                  />
                </li>
              </ul>
              {includeMainWMTS && this.renderCopyWMTS(key)}
            </Dropdown>
          </span>
        </div>
        <button
          className={"button--tms-preview " + prevSelectClass}
          type="button"
          onClick={this.onPreviewSelect.bind(null, { type: "tms", index: key })}
          title="Preview TMS on map"
        >
          <span>preview</span>
        </button>
      </div>
    );
  },

  render: function() {
    var d = this.props.data;
    var pagination = this.props.pagination;

    var tmsOptions = d.properties.tms
      ? this.renderTmsOptions(d.properties.tms, "main", "down", "center", true)
      : null;

    let sp = this.state.selectedPreview;

    return (
      <article
        className={(d.properties.tms ? "has-tms " : "") + "results-single"}
      >
        <header className="pane-header">
          <h1
            className="pane-title with-zoom-to-fit"
            title={d.title.replace(/\.[a-z]+$/, "")}
          >
            {d.title.replace(/\.[a-z]+$/, "")}
          </h1>
          <p className="pane-subtitle">
            {pagination.current} of {pagination.total} results
          </p>
        </header>
        <div className="pane-body">
          <div className="pane-body-inner">
            <div className="single-media">
              <div className="preview-options">
                <h3 className="preview-options__title">Preview</h3>
                <div
                  className="button-group button-group--horizontal preview-options__buttons"
                  role="group"
                >
                  <button
                    className={
                      "button button--small button--display " +
                      (sp === "thumbnail" ? "button--active" : "")
                    }
                    type="button"
                    onClick={this.onPreviewSelect.bind(null, {
                      type: "thumbnail"
                    })}
                  >
                    <span>Thumbnail</span>
                  </button>
                  {d.properties.tms
                    ? <button
                        className={
                          "button button--small button--display " +
                          (sp === "tms" ? "button--active" : "")
                        }
                        type="button"
                        onClick={this.onPreviewSelect.bind(null, {
                          type: "tms"
                        })}
                      >
                        <span>TMS</span>
                      </button>
                    : null}
                  <button
                    className={
                      "button button--small button--display " +
                      (sp === "none" ? "button--active" : "")
                    }
                    type="button"
                    onClick={this.onPreviewSelect.bind(null, { type: "none" })}
                  >
                    <span>None</span>
                  </button>
                </div>
              </div>
              <img
                alt="Result thumbnail"
                src={
                  d.properties.thumbnail ||
                  "assets/graphics/layout/img-placeholder.svg"
                }
              />
            </div>
            <div className="single-actions">
              {tmsOptions}
              <a
                title="Download image"
                className="button-download"
                target="_blank"
                href={d.uuid}
              >
                <span>Download</span>
              </a>
            </div>
            <dl className="single-details">
              <dt>
                <span>Date</span>
              </dt>
              <dd>
                {d.acquisition_start ? d.acquisition_start.slice(0, 10) : "N/A"}
              </dd>
              <dt>
                <span>Resolution</span>
              </dt>
              <dd>
                {utils.gsdToUnit(d.gsd)}
              </dd>
              <dt>
                <span>Type</span>
              </dt>
              <dd>
                {d.properties.tms ? "Image + Map Layer" : "Image"}
              </dd>
              <dt>
                <span>Image Size</span>
              </dt>
              <dd className="cap">
                {prettyBytes(d.file_size)}
              </dd>
              <dt>
                <span>Platform</span>
              </dt>
              <dd className="cap">
                {d.platform}
              </dd>
              <dt>
                <span>Sensor</span>
              </dt>
              <dd className="cap">
                {d.properties.sensor ? d.properties.sensor : "not available"}
              </dd>
              <dt>
                <span>Provider</span>
              </dt>
              <dd className="cap">
                {d.provider}
              </dd>
              {typeof d.user === "undefined"
                ? null
                : <span className="user-details">
                    <dt>
                      <span>User</span>
                    </dt>
                    <dd className="cap">
                      <a href={`#/user/${d.user._id}`}>
                        {d.user.name}
                      </a>
                    </dd>
                  </span>}
            </dl>

            {d.custom_tms
              ? <section className="single-related-tms">
                  <header>
                    <h1>Available map layers</h1>
                    <p>This image is part of the following map layers:</p>
                  </header>
                  <ul>
                    {d.custom_tms.map(
                      function(o, i) {
                        return (
                          <li key={i}>
                            {this.renderTmsOptions(o, i, "up", "right")}
                          </li>
                        );
                      }.bind(this)
                    )}
                  </ul>
                </section>
              : null}
          </div>
        </div>
        <footer className="pane-footer">
          <ul className="single-pager">
            <li className="view-all">
              <a onClick={this.viewAllResults} title="View all results">
                <span>All</span>
              </a>
            </li>
            <li className="view-prev">
              <a
                onClick={this.prevResult}
                className={this.props.pagination.prevId ? "" : "disabled"}
                title="View previous result"
              >
                <span>Prev</span>
              </a>
            </li>
            <li className="view-next">
              <a
                onClick={this.nextResult}
                className={this.props.pagination.nextId ? "" : "disabled"}
                title="View next result"
              >
                <span>Next</span>
              </a>
            </li>
          </ul>
        </footer>
      </article>
    );
  }
});
