import { Router } from "react-router";
import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import util from "util";
import api from "utils/api";
import StatusScene from "./StatusScene";

export default createReactClass({
  displayName: "Status",

  propTypes: {
    params: PropTypes.object,
    query: PropTypes.object
  },

  mixins: [Router.State],

  getInitialState: function() {
    return {
      data: {
        scenes: [{ images: [{ status: "initial" }] }]
      }
    };
  },

  componentDidMount: function() {
    this.watchProcessingStatus();
  },

  componentWillUnmount: function() {
    this.stopWatchProcessingStatus();
  },

  stopWatchProcessingStatus: function() {
    if (this.timer) clearTimeout(this.timer);
  },

  watchProcessingStatus: function() {
    this.checkProcessingStatus(() => {
      if (this.isProcessingStopped()) {
        this.stopWatchProcessingStatus();
        return;
      }

      this.timer = setTimeout(this.watchProcessingStatus, 1000);
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

  render: function() {
    const statusScenes = this.state.data.scenes.map((scene, index) => (
      <StatusScene key={scene._id || index} scene={scene} />
    ));

    if (this.state.errored) {
      return (
        <div className="intro-block">
          <h2>Status upload</h2>
          <p>There was an error: {this.state.message}.</p>
          <pre>{util.inspect(this.state.data)}</pre>
        </div>
      );
    } else {
      return <div>{statusScenes}</div>;
    }
  }
});
