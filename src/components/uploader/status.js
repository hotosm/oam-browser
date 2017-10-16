import { Router } from "react-router";
import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import moment from "moment";

import util from "util";
import utils from "utils/utils";
import api from "utils/api";

function dateFormat(date) {
  // http://momentjs.com/docs/#/displaying/
  return moment(date).format("YYYY-M-D [at] H:mm");
}

export default createReactClass({
  displayName: "Status",

  propTypes: {
    params: PropTypes.object,
    query: PropTypes.object
  },

  mixins: [Router.State],

  getInitialState: function() {
    return {
      pauseProcessingChecks: false,
      data: {
        scenes: [{ images: [{ status: "initial" }] }]
      }
    };
  },

  componentDidMount: function() {
    this.watchProcessingStatus();
  },

  componentWillUnmount: function() {
    this.setState({ pauseProcessingChecks: true });
  },

  watchProcessingStatus: function() {
    if (this.state.pauseProcessingChecks) return;
    this.checkProcessingStatus(() => {
      if (this.isProcessingStopped()) return;
      setTimeout(this.watchProcessingStatus, 1000);
    });
  },

  checkProcessingStatus: function(callback) {
    api({ uri: "/uploads/" + this.props.params.id })
      .then(data => {
        this.setState({
          message: "Imagery processed.",
          data: data.results
        });
        callback();
      })
      .catch(err => {
        this.setState({
          errored: true,
          message: "There was an error getting the imagery status.",
          data: err
        });
        callback();
      });
  },

  isProcessingStopped: function() {
    return (
      this.state.data.scenes.filter(scene => {
        return (
          scene.images.filter(image => {
            return image.status === "initial" || image.status === "processing";
          }).length > 0
        );
      }).length === 0
    );
  },

  gotoImage: function(e, image) {
    e.preventDefault();
    utils.imageUri(image);
  },

  // Unfortunately the /upload endpoint on the API doesn't include the ID for the image's
  // metadata. So we can use an alternate identifier to build the permalink for the imagery.
  // The result_pane.js code will also accept the final filename portion of the UUID.
  // Perhaps indeed that is ultimately a better identifier to use throughout all the code.
  getAlternateIdentityForMeta: function(image) {
    const imageFilename = image.metadata.uuid.split("/").slice(-1)[0];
    return imageFilename;
  },

  renderScene: function(scene) {
    return (
      <section className="panel status-panel">
        <header className="panel-header">
          <div className="panel-headline">
            <h1 className="panel-title">
              Dataset: <span className="given-title">{scene.title}</span>
            </h1>
          </div>
        </header>
        <div className="panel-body">
          <dl className="status-details">
            <dt>Platform</dt>
            <dd>{scene.platform}</dd>
            <dt>Sensor</dt>
            <dd>{scene.sensor || ""}</dd>
            <dt>Provider</dt>
            <dd>{scene.provider}</dd>
            <dt>Acquisition Date</dt>
            <dd>
              {dateFormat(scene.acquisition_start)} -{" "}
              {dateFormat(scene.acquisition_end)}
            </dd>
            {scene.tms ? [<dt>Tile service</dt>, <dd>{scene.tms}</dd>] : ""}
            {scene.contact
              ? [
                  <dt>Contact</dt>,
                  <dd>
                    <span className="name">{scene.contact.name}</span>
                    <span className="email">{scene.contact.email}</span>
                  </dd>
                ]
              : ""}
          </dl>

          {scene.images.map(this.renderImage)}
        </div>
        <footer className="panel-footer" />
      </section>
    );
  },

  renderImage: function(image, i) {
    var status;
    var messages = (image.messages || []).map(function(msg) {
      return <li>{msg}</li>;
    });
    if (image.status === "finished") {
      status = "status-success";
      image.metadata._id = this.getAlternateIdentityForMeta(image);
      messages.unshift(
        <li>
          <a
            onClick={e => this.gotoImage(e, image.metadata)}
            title="View image on OpenAerialMap"
            className="bttn-view-image"
          >
            View image
          </a>
        </li>
      );
    } else if (image.status === "processing") {
      status = "status-processing";
      messages.unshift(<li>Upload in progress.</li>);
    } else if (image.status === "errored") {
      status = "status-error";
      messages.unshift(
        <li>
          <strong>Upload failed: </strong> {image.error.message}
        </li>
      );
    }

    status = " " + status + " ";

    var imgStatusMatrix = {
      initial: "Pending",
      processing: "Processing",
      finished: "Finished",
      errored: "Errored"
    };

    return (
      <div className={"image-block" + status}>
        <h2 className="image-block-title">Image {i}</h2>
        <dl className="status-details">
          <dt>Started</dt>
          <dd>{dateFormat(image.startedAt)}</dd>
          {image.stoppedAt
            ? [
                <dt>{image.status === "finished" ? "Finished" : "Stopped"}</dt>,
                <dd>{dateFormat(image.stoppedAt)}</dd>
              ]
            : ""}
          <dt>Status</dt>
          <dd>
            <div className={"status " + status}>
              {imgStatusMatrix[image.status]}
              {image.status === "initial" || image.status === "processing" ? (
                <div className="sk-folding-cube">
                  <div className="sk-cube1 sk-cube" />
                  <div className="sk-cube2 sk-cube" />
                  <div className="sk-cube4 sk-cube" />
                  <div className="sk-cube3 sk-cube" />
                </div>
              ) : (
                ""
              )}
            </div>
          </dd>
          <dt>Info</dt>
          <dd className="info-detail">
            <ul>{messages}</ul>
          </dd>
        </dl>
      </div>
    );
  },

  render: function() {
    if (this.state.errored) {
      return (
        <div className="intro-block">
          <h2>Status upload</h2>
          <p>There was an error: {this.state.message}.</p>
          <pre>{util.inspect(this.state.data)}</pre>
        </div>
      );
    }

    return (
      <div>
        {this.state.data.scenes.map(
          function(scene) {
            return this.renderScene(scene);
          }.bind(this)
        )}
      </div>
    );
  }
});
