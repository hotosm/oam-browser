import React from "react";
import createReactClass from "create-react-class";
import PropTypes from "prop-types";
import qs from "querystring";
import centroid from "turf-centroid";
import Keys from "react-keybinding";
import Dropdown from "oam-design-system/dropdown";
import prettyBytes from "pretty-bytes";

import CloseIcon from "mdi-react/CloseIcon";
import ImageFilterCenterFocusIcon from "mdi-react/ImageFilterCenterFocusIcon";
import DotsVerticalIcon from "mdi-react/DotsVerticalIcon";
import DownloadIcon from "mdi-react/DownloadIcon";
import ImageFilterIcon from "mdi-react/ImageFilterIcon";
import ContentCopyIcon from "mdi-react/ContentCopyIcon";
import OpenInNewIcon from "mdi-react/OpenInNewIcon";
import ChevronLeftIcon from "mdi-react/ChevronLeftIcon";
import ChevronRightIcon from "mdi-react/ChevronRightIcon";

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
    data: PropTypes.object,
    user: PropTypes.object
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
    },
    esc: function() {
      if (this.props.results.length === 0) {
        return;
      }
      this.closeResults();
    }
  },

  getInitialState: function() {
    return {
      selectedPreview: "tms"
    };
  },

  componentDidMount: function() {
    actions.selectPreview({
      type: this.state.selectedPreview
    });
  },

  onPreviewSelect: function(what) {
    actions.selectPreview(what);
    this.setState({ selectedPreview: what.type });
  },

  gotoUsersImages: function(e, user_id) {
    e.preventDefault();
    utils.pushURI(this.props, {
      square: null,
      user: user_id,
      image: null
    });
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

  licenseLinks: {
    "CC-BY 4.0": "https://creativecommons.org/licenses/by/4.0/",
    "CC BY-NC 4.0": "https://creativecommons.org/licenses/by-nc/4.0/",
    "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/"
  },

  onCopy: function(key, trigger) {
    // Close the dropdown.
    this.refs[`tms-drop-${key}`].close();
    // Return the copy text.
    return this.refs[`tms-url-${key}`].value;
  },

  onOpenJosm: function(tmsUrl) {
    const data = this.props.data;
    const source = `OpenAerialMap - ${data.provider} - ${data.uuid}`;
    const urlPrefix = "http://127.0.0.1:8111";

    const boundingBox = {
      left: data.bbox[0],
      right: data.bbox[2],
      bottom: data.bbox[1],
      top: data.bbox[3]
    };

    const josmQueryString = qs.stringify(
      Object.assign({}, boundingBox, { source })
    );

    // Reference:
    // http://josm.openstreetmap.de/wiki/Help/Preferences/RemoteControl#load_and_zoom
    fetch(`${urlPrefix}/load_and_zoom?${josmQueryString}`)
      .then(response => {
        let promise;
        if (response.ok) {
          promise = response;
        } else {
          promise = Promise.reject(new Error(`HTTP Error ${response.status}`));
        }
        return promise;
      })
      .then(data => {
        // Reference:
        // http://josm.openstreetmap.de/wiki/Help/Preferences/RemoteControl#imagery
        // Note: `url` needs to be the last parameter.
        const imageryQueryString = qs.stringify({
          type: "tms",
          title: source,
          url: tmsUrl
        });
        return fetch(`${urlPrefix}/imagery?${imageryQueryString}`);
      })
      .then(response => {
        if (response.ok) {
          actions.openModal("message", {
            title: "Success",
            message: <p>This scene has been loaded into JOSM.</p>
          });
        } else {
          return Promise.reject(new Error(`HTTP Error ${response.status}`));
        }
      })
      .catch(err => {
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

  renderTmsOptions: function() {
    return (
      <span>
        <ContentCopyIcon /> Copy image URL
        <div className="actions">
          {this.props.data.properties.tms ? (
            <ZcButton
              onCopy={() => this.props.data.properties.tms}
              title="Copy TMS url"
              text="TMS"
            />
          ) : null}{" "}
          |{" "}
          {this.props.data.properties.wmts ? (
            <ZcButton
              onCopy={() => this.props.data.properties.wmts}
              title="Copy WMTS url"
              text="WMTS"
            />
          ) : null}
        </div>
      </span>
    );
  },

  renderOpenInOptions: function() {
    // grab centroid of the footprint
    var center = centroid(this.props.data.geojson).geometry.coordinates;
    // cheat by using current zoom level
    var zoom = this.props.map.view.split(",")[2];
    var idUrl =
      "http://www.openstreetmap.org/edit?editor=id" +
      "#map=" +
      [zoom, center[1], center[0]].join("/") +
      "&" +
      qs.stringify({
        background: "custom:" + this.props.data.properties.tms
      });
    return (
      <span>
        <OpenInNewIcon /> Open in
        <div className="actions">
          <a href={idUrl} target="_blank" title="Open with iD editor">
            iD editor
          </a>{" "}
          |{" "}
          <a
            onClick={() => this.onOpenJosm(this.props.data.properties.tms)}
            title="Open with JOSM"
          >
            JOSM
          </a>
        </div>
      </span>
    );
  },

  paneMenuDropdown: function() {
    return (
      <Dropdown
        triggerElement="a"
        triggerClassName="pane-more"
        triggerActiveClassName="button--active"
        triggerTitle="Share imagery or report a problem"
        triggerText=""
        direction="down"
        alignment="right"
      >
        <ul className="drop__menu info-menu" role="menu">
          <li>
            <a
              className="drop__menu-item"
              href={`https://twitter.com/share?url=${encodeURIComponent(
                window.location.href
              )}`}
              target="_blank"
              title="Share on twitter"
              data-hook="dropdown:close"
            >
              <span>Share on Twitter</span>
            </a>
          </li>

          <li>
            <a
              className="drop__menu-item"
              href={`http://facebook.com/sharer.php?u=${encodeURIComponent(
                window.location.href
              )}`}
              target="_blank"
              title="Share on Facebook"
              data-hook="dropdown:close"
            >
              <span>Share on Facebook</span>
            </a>
          </li>
        </ul>

        <ul className="drop__menu info-menu" role="menu">
          <li>
            <a
              className="drop__menu-item"
              title="Report a problem"
              data-hook="dropdown:close"
              onClick={this.feedbackClickHandler}
            >
              <span>Report a problem</span>
            </a>
          </li>
        </ul>
      </Dropdown>
    );
  },

  paneMenu: function() {
    return (
      <div className="pane-menu">
        <a
          title="Download raw .tiff image file"
          className="button-download"
          target="_blank"
          href={this.props.data.uuid.replace("http://", "https://")}
        >
          <DownloadIcon />
        </a>
        <a
          onClick={this.zoomToFit}
          className="pane-zoom-to-fit"
          title="Zoom to fit imagery on screen"
        >
          <ImageFilterCenterFocusIcon />
        </a>

        <a
          onClick={this.closeResults}
          className="pane-dismiss"
          title="Exit selection"
        >
          <CloseIcon />
        </a>
        <span className="pane-menu-dropdown-button">
          <DotsVerticalIcon />
          {this.paneMenuDropdown()}
        </span>
      </div>
    );
  },

  feedbackClickHandler: function(e) {
    actions.openModal("feedback");
  },

  zoomToFit: function(e) {
    e.preventDefault();
    const bbox = this.props.data.bbox;
    actions.fitToBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
  },

  closeResults: function(e) {
    e.preventDefault();
    utils.pushURI(this.props, {
      image: null
    });
  },

  previewOptions: function() {
    let sp = this.state.selectedPreview;
    return (
      <div className="preview-options">
        <ImageFilterIcon /> Display as
        <div className="actions">
          {this.props.data.properties.tms ? (
            <button
              className={
                "preview-tms " + (sp === "tms" ? "button--active" : "")
              }
              type="button"
              onClick={this.onPreviewSelect.bind(null, {
                type: "tms"
              })}
            >
              <span>TMS</span>
            </button>
          ) : null}
          <button
            className={
              "preview-thumbnail " +
              (sp === "thumbnail" ? "button--active" : "")
            }
            type="button"
            onClick={this.onPreviewSelect.bind(null, {
              type: "thumbnail"
            })}
          >
            <span>Thumbnail</span>
          </button>
        </div>
      </div>
    );
  },

  render: function() {
    var d = this.props.data;
    var pagination = this.props.pagination;

    return (
      <article
        className={(d.properties.tms ? "has-tms " : "") + "results-single"}
      >
        <header className="pane-header">
          <h2
            className="pane-title with-zoom-to-fit"
            title={d.title.replace(/\.[a-z]+$/, "")}
          >
            {d.title.replace(/\.[a-z]+$/, "")}
          </h2>
          {this.props.params.image_id ? this.paneMenu() : null}
        </header>
        <div className="pane-body">
          <div className="pane-body-inner">
            <div className="single-media">
              <span className="user-details">
                {typeof this.props.user.name !== "undefined" ? (
                  <a
                    onClick={e => this.gotoUsersImages(e, this.props.user._id)}
                  >
                    {typeof this.props.user.profile_pic_uri !== "undefined" ? (
                      <div className="profile-pic-wrapper">
                        <img
                          src={this.props.user.profile_pic_uri}
                          alt="Uploader"
                        />
                      </div>
                    ) : null}
                    <div>
                      <small className="uploaded_by">Uploaded by</small>
                      {this.props.user.name}
                    </div>
                  </a>
                ) : (
                  <span>{d.provider}</span>
                )}
              </span>
              <div className="result-thumbnail">
                <img
                  alt="Result thumbnail"
                  src={
                    d.properties.thumbnail ||
                    "assets/graphics/layout/img-placeholder.svg"
                  }
                />
              </div>
            </div>
            <div className="single-actions">
              <ul>
                <li>{this.previewOptions()}</li>
                <li>{this.renderOpenInOptions()}</li>
                <li>{this.renderTmsOptions()}</li>
              </ul>
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
              <dd>{utils.gsdToUnit(d.gsd)}</dd>
              <dt>
                <span>Provider</span>
              </dt>
              <dd>{d.provider}</dd>
              <dt>
                <span>Platform</span>
              </dt>
              <dd className="cap">
                {d.platform === "uav" ? d.platform.toUpperCase() : d.platform}
              </dd>
              <dt>
                <span>Sensor</span>
              </dt>
              <dd className="cap">
                {d.properties.sensor ? d.properties.sensor : "not available"}
              </dd>
              <dt>
                <span>Image Size</span>
              </dt>
              <dd className="cap">{prettyBytes(d.file_size)}</dd>
              <dt>
                <span>Type</span>
              </dt>
              <dd>{d.properties.tms ? "Image + Map Layer" : "Image"}</dd>
              <dt>
                <span>License</span>
              </dt>
              <dd>
                <a
                  href={this.licenseLinks[d.properties.license]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {d.properties.license}
                </a>
              </dd>
            </dl>

            {d.custom_tms ? (
              <section className="single-related-tms">
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
            ) : null}
          </div>
        </div>
        <footer className="single-footer">
          <div className="single-pager">
            <a
              onClick={this.prevResult}
              className={this.props.pagination.prevId ? "previous" : "disabled"}
              title="View previous result"
            >
              <ChevronLeftIcon />
              Previous
            </a>
            <span className="pane-subtitle">
              {pagination.current} of {pagination.total} results
            </span>
            <a
              onClick={this.nextResult}
              className={this.props.pagination.nextId ? "next" : "disabled"}
              title="View next result"
            >
              Next
              <ChevronRightIcon />
            </a>
          </div>
        </footer>
      </article>
    );
  }
});
