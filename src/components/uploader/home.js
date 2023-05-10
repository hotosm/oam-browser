import React from "react";
import createReactClass from "create-react-class";
import ValidationMixin from "react-validation-mixin";
import Joi from "joi-browser";
import Evaporate from "evaporate";
import crypto from "crypto";
import buffer from "buffer";
import Scene from "components/uploader/scene";
import AppActions from "actions/actions";
import imageryValidations from "components/shared/imagery_validations";
import _ from "lodash";
import PlusIcon from "mdi-react/PlusIcon";
import config from "config";
import api from "utils/api";
import { sanitizeFilenameForURL } from "utils/sanitize-filename";
import UploadModal from "components/modals/upload_modal";

const LS_SCENES_KEY = "scenes-form-fields";

function getSceneDefaultState() {
  var midnight = new Date();
  midnight.setMilliseconds(0);
  midnight.setSeconds(0);
  midnight.setMinutes(0);
  midnight.setHours(0);
  var now = new Date();

  return {
    title: "",
    "platform-type": "satellite",
    sensor: "",
    "date-start": midnight.toISOString(),
    "date-end": now.toISOString(),
    "img-loc": [],
    "tile-url": "",
    provider: "",
    "contact-type": "uploader",
    "contact-name": "",
    "contact-email": "",
    license: "CC-BY 4.0",
    tags: ""
  };
}

function createProgressTracker({ progressStats, fileName, onProgress }) {
  return function(_percentComplete, stats) {
    console.log("progress", stats);
    progressStats[fileName] = stats;
    const progressStatsValues = Object.values(progressStats);
    const { sumTotalUploaded, sumFilesize } = progressStatsValues.reduce(
      (accumulator, current) => {
        if (current.loaded >= 0)
          return {
            sumTotalUploaded:
              accumulator.sumTotalUploaded + current.totalUploaded,
            sumFilesize: accumulator.sumFilesize + current.fileSize
          };

        return accumulator;
      },
      { sumTotalUploaded: 0, sumFilesize: 0 }
    );

    const percentComplete =
      sumFilesize === 0 ? 0 : Math.round(sumTotalUploaded / sumFilesize * 100);

    onProgress(percentComplete);
  };
}

function uploadFile({
  file,
  progressTracker,
  onUploadComplete = () => {},
  setCancelCallback = () => {}
}) {
  const signerUrl = `${config.catalog.url}/signupload`;
  const bucket = config.uploadBucket;
  const aws_key = config.awsKey;
  const Buffer = buffer.Buffer;

  return Evaporate.create({
    awsRegion: config.awsRegion,
    aws_key,
    signerUrl,
    bucket,
    computeContentMd5: true,
    cryptoMd5Method: function(data) {
      return crypto
        .createHash("md5")
        .update(Buffer.from(data))
        .digest("base64");
    },
    cryptoHexEncodedHash256: function(data) {
      return crypto
        .createHash("sha256")
        .update(Buffer.from(data))
        .digest("hex");
    },
    cloudfront: true,
    xhrWithCredentials: true,
    logging: false
  }).then(evaporate => {
    setCancelCallback(() => {
      evaporate.cancel(`${bucket}/${file.newName}`);
    });

    return evaporate
      .add({
        name: file.newName,
        file: file.data,
        progress: progressTracker
      })
      .then(onUploadComplete);
  });
}

// Sanity note:
// There are some places where the component state is being altered directly.
// This happens because of javascript objects work. Ex:
//   onSceneValueChange: function (sceneIndex, fieldName, fieldValue) {
//     var scenes = this.state.scenes;
//     scenes[sceneIndex][fieldName] = fieldValue;
//     this.setState({scenes: scenes});
//   },
// The solution would be to clone the state every time, but since we're
// ALWAYS calling setState after one of these changes, it's not a problem.

export default createReactClass({
  displayName: "Home",

  mixins: [ValidationMixin],

  validatorTypes: {
    scenes: Joi.array().items(
      Joi.object().keys(
        _.assign(imageryValidations, {
          "img-loc": Joi.array()
            .min(1)
            .items(
              Joi.object().keys({
                url: Joi.label("Imagery url").when("origin", {
                  is: "upload",
                  then: Joi.string().required(),
                  otherwise: Joi.string()
                    .uri()
                    .required()
                }),
                origin: Joi.string()
                  .required()
                  .label("Imagery file origin"),
                file: Joi.label("File").when("origin", {
                  is: "upload",
                  then: Joi.object().required()
                })
              })
            )
            .label("Imagery location")
        })
      )
    )
  },

  // Store entered values to these values in order to prepopulate the form on the next visit
  fieldsToPrepopulate: {
    scene: [
      "title",
      "platform-type",
      "sensor",
      "date-start",
      "dte-end",
      "tile-url",
      "provider",
      "contact-type",
      "contact-name",
      "contact-email",
      "license",
      "tags"
    ]
  },

  getInitialState: function() {
    return {
      scenes: this.getScenesDataTemplate(),
      uploadActive: false,
      uploadProgress: 0,
      uploadError: false,
      uploadedCount: 0,
      uploadCancelled: false,
      submitting: false,
      online: navigator.onLine
    };
  },

  getScenesDataTemplate: function() {
    return (
      JSON.parse(localStorage.getItem(LS_SCENES_KEY)) || [
        getSceneDefaultState()
      ]
    );
  },

  getSceneImgLocTemplate: function(origin) {
    return { url: "", origin };
  },

  addScene: function() {
    var scenes = this.state.scenes;
    scenes.push(getSceneDefaultState());
    this.setState({ scenes: scenes });
  },

  removeScene: function(sceneIndex) {
    var scenes = this.state.scenes;
    scenes.splice(sceneIndex, 1);
    this.setState({ scenes: scenes });
  },

  addImageryLocationToScene: function(sceneIndex, origin) {
    let scenes = this.state.scenes;
    let imgLoc = this.getSceneImgLocTemplate(origin);
    scenes[sceneIndex]["img-loc"].push(imgLoc);
    this.setState({ scenes: scenes });
  },

  removeImageryLocatioFromScene: function(sceneIndex, imgLocIndex) {
    var scenes = this.state.scenes;
    scenes[sceneIndex]["img-loc"].splice(imgLocIndex, 1);
    this.setState({ scenes: scenes });
  },

  onSceneValueChange: function(sceneIndex, fieldName, fieldValue) {
    var scenes = this.state.scenes;
    scenes[sceneIndex][fieldName] = fieldValue;
    this.setState({ scenes: scenes });
  },

  onValueChange: function(event) {
    var data = {};
    data[event.target.name] = event.target.value;
    this.setState(data);
  },

  resetForm: function() {
    this.setState({
      scenes: [getSceneDefaultState()]
    });
  },

  onOnlineStatusChange: function() {
    if (this.state.online === navigator.onLine) return;

    this.setState(prevState => {
      if (prevState.online && !navigator.onLine) {
        AppActions.showNotification(
          "alert",
          "Uploading was stopped. Check your internet connection."
        );
      }
      return { ...prevState, online: navigator.onLine };
    });
  },

  componentDidMount: function() {
    window.addEventListener("online", this.onOnlineStatusChange);
    window.addEventListener("offline", this.onOnlineStatusChange);
    this.onOnlineStatusChange();
  },

  componentWillUnmount: function() {
    window.removeEventListener("online", this.onOnlineStatusChange);
    window.removeEventListener("offline", this.onOnlineStatusChange);
  },

  componentDidUpdate: function() {
    // Store entered values to these values in order to keep the form populated
    // Exept imagery locations
    localStorage.setItem(
      LS_SCENES_KEY,
      JSON.stringify(
        this.state.scenes.map(scene => ({
          ...scene,
          "img-loc": []
        }))
      )
    );
  },

  onSubmit: function(event) {
    event.preventDefault();

    // Warning... Controlled HACK.
    // The state should never be changed in this way as it doesn't trigger
    // a render, however it will be updated by the validate function later on.
    // This is needed to clear previous errors as the plugin doesn't handle
    // arrays of objects specially well.
    this.state.errors = {}; // eslint-disable-line

    this.validate(
      function(error, validationErrors) {
        if (error) {
          console.log(validationErrors);
          AppActions.showNotification("alert", "Form contains errors!");
        } else {
          this.setState({ submitting: true });

          AppActions.clearNotification();

          // All is well.
          // SUBMIT DATA.
          //
          // 1 - Prepare data in state.
          // 2 - Submit.
          // 3 - Set form feedback with -- this.setFormFeedback(type, message);
          //   - TYPE can be: alert success warning info
          // 4 - Hide loading. -- this.setState({loading: false});
          // 5 - Reset form when success. -- this.resetForm();

          var data = {
            scenes: this.state.scenes.map(function(scene) {
              var contact = null;
              if (scene["contact-type"] === "other") {
                contact = {
                  name: scene["contact-name"],
                  email: scene["contact-email"]
                };
              }

              var tms = scene["tile-url"].trim();
              tms = tms.length === 0 ? undefined : tms;

              // Generate random filenames, to avoid collisions at the API
              const randomizeName = filename => {
                const ext = filename.substr(filename.lastIndexOf("."));
                const basename = filename.replace(ext, "");
                const sanitized = sanitizeFilenameForURL(basename);
                const randStr = Math.random()
                  .toString(36)
                  .substring(5);
                return `${sanitized}-${randStr}${ext}`;
              };
              let files = [];
              let urls = [];
              scene["img-loc"].forEach(o => {
                if (o.file && !o.file.name && o.origin === "upload") {
                  // NOTE: Content of placeholder uploading field need to be ignored
                  // this is not an issue when there is at least one "local" file selected
                  // but resuluts in malformed request when all files are uploaded from
                  // dropbox or google drive
                  return;
                }

                if (o.file) {
                  const name = randomizeName(o.file.name);
                  files.push({ newName: name, data: o.file });
                  urls.push(
                    `https://${config.uploadBucket}.s3.${config.awsRegion}.amazonaws.com/${name}`
                  );
                } else {
                  urls.push(o.url);
                }
              });

              return {
                contact: contact,
                title: scene.title,
                provider: scene.provider,
                platform: scene["platform-type"],
                sensor: scene.sensor,
                acquisition_start: scene["date-start"],
                acquisition_end: scene["date-end"],
                tms: tms,
                license: scene.license,
                tags: scene.tags,
                urls: urls,
                files: files
              };
            })
          };

          // Gather list of files to upload
          let uploads = [];
          data.scenes.forEach(scene => {
            if (scene.files.length) {
              scene.files.forEach(file => {
                if (file.data) uploads.push(file);
              });
            }
            // Remove file references from JSON data (not saved in database)
            delete scene.files;
          });
          const totalFiles = uploads.length;
          if (!totalFiles) {
            // Submit the form now
            this.submitData(data);
          } else {
            // Upload list of files before submitting the form
            let progressStats = {};
            const uploadPromises = [];
            this.cancelPromises = [];
            this.setState({ uploadedCount: 0, uploadActive: true });
            uploads.forEach(file => {
              const progressTracker = createProgressTracker({
                progressStats,
                fileName: file.newName,
                onProgress: uploadProgress => {
                  this.setState(prevState => {
                    if (
                      !this.state.uploadCancelled &&
                      this.state.online &&
                      prevState.uploadProgress <= uploadProgress
                    )
                      return { ...prevState, uploadProgress };

                    return prevState;
                  });
                }
              });

              const promise = uploadFile({
                file,
                progressTracker,
                onUploadComplete: () =>
                  this.setState({
                    uploadedCount: this.state.uploadedCount + 1
                  }),
                setCancelCallback: cancel => this.cancelPromises.push(cancel)
              });

              uploadPromises.push(promise);
            });

            Promise.all(uploadPromises)
              .then(async () => {
                this.setState({
                  uploadError: false,
                  uploadActive: false,
                  uploadedCount: 0,
                  submitting: false
                });

                await this.submitData(data);
              })
              .catch(error => {
                console.error(error);
                if (this.state.uploadCancelled) {
                  this.setState({
                    uploadActive: false,
                    uploadProgress: 0,
                    uploadError: false,
                    uploadedCount: 0,
                    uploadCancelled: false,
                    submitting: false
                  });

                  AppActions.clearNotification();

                  return;
                }

                this.onSubmitError();
              });
          }
        }
      }.bind(this)
    );
  },

  cancelPromises: [],

  onCancel: function() {
    if (this.state.uploadCancelled) return;

    AppActions.showNotification("alert", "Cancelling the current upload");

    this.setState({ uploadCancelled: true });

    this.cancelPromises.forEach(cancel => cancel());
  },

  onSubmitError: function() {
    this.setState({
      uploadError: true,
      uploadActive: false,
      submitting: false
    });

    AppActions.showNotification(
      "alert",
      <span>There was a problem uploading the files.</span>
    );
  },

  submitData: async function(data) {
    await api({
      uri: "/uploads",
      auth: true,
      method: "POST",
      body: data
    }).then(data => {
      var id = data.results.upload;

      // Clear form data from localStorage after successful upload
      localStorage.removeItem(LS_SCENES_KEY);
      this.setState(this.getInitialState());

      AppActions.showNotification(
        "success",
        <span>
          Your upload request was successfully submitted and is being processed.{" "}
          <a href={"#/upload/status/" + id}>Check upload status.</a>
        </span>
      );
    });
  },

  renderErrorMessage: function(message) {
    message = message || "";
    if (message.trim().length === 0) {
      return null;
    }

    return <p className="message message-alert">{message}</p>;
  },

  renderScene: function(data, index) {
    return (
      <Scene
        type={"uploader"}
        key={index}
        total={this.state.scenes.length}
        index={index}
        data={data}
        onValueChange={this.onSceneValueChange}
        removeScene={this.removeScene}
        addImageryLocationToScene={this.addImageryLocationToScene}
        removeImageryLocatioFromScene={this.removeImageryLocatioFromScene}
        handleValidation={this.handleValidation}
        getValidationMessages={this.getValidationMessages}
        renderErrorMessage={this.renderErrorMessage}
      />
    );
  },

  render: function() {
    const uploadingFilesCount = this.state.scenes.reduce(
      (acc, scene) =>
        acc +
        scene["img-loc"].filter(o => o.file && o.origin === "upload").length,
      0
    );

    return (
      <div className="form-wrapper">
        <UploadModal
          revealed={this.state.uploadActive}
          progress={this.state.uploadProgress}
          imageCount={uploadingFilesCount}
          onCancel={this.onCancel}
          stopped={!this.state.online}
        />
        <section className="panel upload-panel">
          <header className="panel-header">
            <div className="panel-headline">
              <h1 className="panel-title">Upload Imagery</h1>
            </div>
          </header>
          <div className="panel-body">
            <div className="meter">
              <span />
            </div>

            <form id="upload-form" className="form-horizontal">
              <div className="meter">
                <span />
              </div>

              {this.state.scenes.map(this.renderScene)}

              <div className="form-extra-actions">
                <button
                  type="button"
                  className="bttn bttn-secondary bttn-block bttn-icon"
                  onClick={this.addScene}
                  title="Add new dataset"
                >
                  <span>New dataset</span>
                  <PlusIcon />
                </button>
              </div>

              <div className="form-note">
                <p>
                  By submitting imagery to OpenAerialMap, you agree to place
                  your imagery into the{" "}
                  <a
                    href="https://github.com/openimagerynetwork/oin-register#open-imagery-network"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Imagery Network (OIN)
                  </a>
                </p>
                <p>
                  Except when permitted by the OpenStreetMap exception (see
                  below), all imagery contained in OIN is licensed{" "}
                  <a
                    href="https://creativecommons.org/licenses/by/4.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    CC-BY 4.0
                  </a>
                  , with attribution as "© OIN contributors", and specific
                  additional SA/NC conditions if selected upon upload.
                </p>
                <p>
                  IMPORTANT NOTICE - OPENSTREETMAP EXCEPTION: You agree that
                  users do not have to comply with the selected license when the
                  imagery is used for tracing in OpenStreetMap. In these cases,
                  you agree that the derived data from the imagery is made
                  available under the ODBL license.
                </p>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="bttn bttn-lg bttn-block bttn-submit"
                  onClick={this.onSubmit}
                  disabled={this.state.submitting || this.state.uploadActive}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
          <footer className="panel-footer" />
        </section>
      </div>
    );
  }
});
