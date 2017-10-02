import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import ValidationMixin from "react-validation-mixin";
import Joi from "joi-browser";
import _ from "lodash";

import api from "utils/api";
import Scene from "components/uploader/scene";
import imageryValidations from "components/shared/imagery_validations";
import AppActions from "actions/actions";

export default createReactClass({
  displayName: "ImageryEdit",

  apiPath: function() {
    return "/meta/" + this.props.params.id;
  },

  mixins: [ValidationMixin],

  propTypes: {
    params: PropTypes.object
  },

  validatorTypes: {
    scenes: Joi.array().items(Joi.object().keys(imageryValidations))
  },

  getInitialState: function() {
    return {
      loading: true,
      // An array because this code is borrowed from the uploader,
      // where you can upload multiple images as part of a single
      // scene.
      // TODO: Properly refactor from the uploader code.
      scenes: [{}]
    };
  },

  componentDidMount: function() {
    this.fetchImageryData();
  },

  getAllowedFields: function() {
    return [
      "title",
      "platform",
      "provider",
      "sensor",
      "acquisition-start",
      "acquisition-end",
      "contact",
      "tags",
      "license"
    ];
  },

  fetchImageryData: function() {
    api({
      uri: this.apiPath(),
      auth: true
    }).then(response => {
      const imagery = this.convertDBMetaToFormFields(response.results);
      this.setState({
        loading: false,
        scenes: [imagery]
      });
    });
  },

  submitImageryData: function() {
    this.setState({ loading: true });
    api({
      uri: this.apiPath(),
      auth: true,
      method: "PUT",
      body: this.convertFormFieldsToDBMeta(this.state.scenes[0])
    }).then(response => {
      AppActions.showNotification("success", "Imagery updated.");
      this.setState({ loading: false });
    });
  },

  onSubmit: function(event) {
    event.preventDefault();

    // Clear previous errors
    this.setState({ errors: null });
    this.validate(this.onValidation.bind(this));
  },

  convertDBMetaToFormFields: function(meta) {
    let fields = meta;
    let start = new Date(meta.acquisition_start);
    let end = new Date(meta.acquisition_end);
    let contact = meta.contact.split(",");

    fields["platform-type"] = meta.platform;
    fields["sensor"] = meta.properties.sensor;
    fields["date-start"] = start.toISOString();
    fields["date-end"] = end.toISOString();
    fields["contact-type"] = "other";
    fields["contact-name"] = contact[0];
    fields["contact-email"] = contact[1];
    fields["license"] = "CC-BY 4.0";
    return fields;
  },

  convertFormFieldsToDBMeta: function(fields) {
    let meta = _.pick(fields, this.getAllowedFields());

    meta["contact"] = `${fields["contact-name"]},${fields["contact-email"]}`;
    meta["platform"] = fields["platform-type"];
    meta["acquisition_start"] = fields["date-start"];
    meta["acquisition_end"] = fields["date-end"];
    delete meta["sensor"];
    meta["properties"] = {
      sensor: fields["sensor"]
    };
    return meta;
  },

  onSceneValueChange: function(sceneIndex, fieldName, fieldValue) {
    var scenes = this.state.scenes;
    scenes[sceneIndex][fieldName] = fieldValue;
    this.setState({ scenes: scenes });
  },

  onValidation: function(error, validationErrors) {
    if (error) {
      console.log(validationErrors);
      AppActions.showNotification("alert", "Form contains errors!");
    } else {
      if (this.state.loading) {
        // Submit already in process.
        return;
      }
      this.setState({ loading: true });
      AppActions.clearNotification();
      this.submitImageryData();
    }
  },

  renderErrorMessage: function(message) {
    message = message || "";
    if (message.trim().length === 0) {
      return null;
    }

    return <p className="message message-alert">{message}</p>;
  },

  render: function() {
    return (
      <div className="imagery-editor form-wrapper">
        <section className="panel upload-panel">
          <header className="panel-header">
            <div className="panel-headline">
              <h1 className="panel-title">Edit Imagery</h1>
            </div>
          </header>
          <div className="panel-body">
            <form id="upload-form" className="form-horizontal">
              <Scene
                key={0}
                index={0}
                type={"editor"}
                data={this.state.scenes[0]}
                onValueChange={this.onSceneValueChange}
                handleValidation={this.handleValidation}
                getValidationMessages={this.getValidationMessages}
                renderErrorMessage={this.renderErrorMessage}
              />

              <div className="form-actions">
                <a
                  type="submit"
                  className="bttn bttn-lg bttn-block bttn-submit"
                  onClick={this.onSubmit}
                >
                  Submit
                </a>
              </div>
            </form>
          </div>
          <footer className="panel-footer" />
        </section>
      </div>
    );
  }
});
