/* global Dropbox */

// Named scene.js based on original way of referring to how image files are grouped together
// To avoid confusion on frontend, labels have been renamed to datasets
// Continuing to use the term scene for variables and functions

import PropTypes from "prop-types";
import React from "react";
import DateTimePicker from "react-widgets/lib/DateTimePicker";
import moment from "moment";
import momentLocalizer from "react-widgets/lib/localizers/moment";

import DeleteIcon from "mdi-react/DeleteIcon";
import FileIcon from "mdi-react/FileIcon";
import LinkVariantIcon from "mdi-react/LinkVariantIcon";
import DropboxIcon from "mdi-react/DropboxIcon";
import GoogleDriveIcon from "mdi-react/GoogleDriveIcon";

import ImageryLocation from "components/uploader/imagery-location";
import gDrive from "utils/google";

momentLocalizer(moment);

export default class extends React.Component {
  static displayName = "Scene";

  static propTypes = {
    onValueChange: PropTypes.func,
    removeScene: PropTypes.func,
    renderErrorMessage: PropTypes.func,
    getValidationMessages: PropTypes.func,
    handleValidation: PropTypes.func,

    addImageryLocationToScene: PropTypes.func,
    removeImageryLocatioFromScene: PropTypes.func,

    type: PropTypes.string,
    index: PropTypes.number,
    total: PropTypes.number,
    data: PropTypes.object
  };

  // Only allow a start date chage to trigger an end date change once
  firstStartDateChange = true;

  getName = fieldName => {
    return "scene[" + this.props.index + "][" + fieldName + "]";
  };

  getId = fieldName => {
    return "scene-" + this.props.index + "-" + fieldName;
  };

  getRadioName = fieldName => {
    return this.getName(fieldName) + "[]";
  };

  onChange = e => {
    var pieces = e.target.name.match(/scene\[([0-9]+)\]\[([a-z0-9-]+)\]/);
    // sceneIndex, fieldName, fieldValue
    this.props.onValueChange(pieces[1], pieces[2], e.target.value);
  };

  onDateChange = (field, date, dateString) => {
    var val = date === null ? null : date.toISOString();
    this.props.onValueChange(this.props.index, field, val);
    // Try to be helpful by syncing the end date to the start date
    // the first time the start date is changed. Most useful if you
    // go a long way back in time.
    if (
      field === "date-start" &&
      (this.firstStartDateChange || this.getValueForDate("date-end") < date)
    ) {
      date.setHours(date.getHours() + 1);
      this.props.onValueChange(
        this.props.index,
        "date-end",
        date.toISOString()
      );
      this.firstStartDateChange = false;
    }
  };

  onImgLocValueChange = (fieldIndex, fieldName, fieldValue) => {
    // Update the imagery location array and then use onValueChange
    // function to send the new values to parent.
    let vals = this.props.data["img-loc"];
    // When dealing with a direct upload, we need to store the file info not
    // the url. The url here is just to avoid errors.
    if (fieldName === "upload") {
      vals[fieldIndex].file = fieldValue;
      vals[fieldIndex].url = `file://${fieldValue.name}`;
    } else {
      vals[fieldIndex][fieldName] = fieldValue;
    }
    // sceneIndex, fieldName, fieldValue
    this.props.onValueChange(this.props.index, "img-loc", vals);
  };

  addImageryLocation = origin => {
    this.props.addImageryLocationToScene(this.props.index, origin);
  };

  removeImageryLocation = locIndex => {
    this.props.removeImageryLocatioFromScene(this.props.index, locIndex);
  };

  importDropboxClick = () => {
    this.addImageryLocation("dropbox");
    let imgLocIndex = this.props.data["img-loc"].length - 1;
    // Next tick.
    setTimeout(() => {
      Dropbox.choose({
        success: files => {
          files.forEach((o, i) => {
            if (i === 0) {
              this.onImgLocValueChange(imgLocIndex, "url", o.link);
            } else {
              this.props.addImageryLocationToScene(this.props.index, "dropbox");
              this.onImgLocValueChange(imgLocIndex + i, "url", o.link);
            }
          });
        },

        cancel: () => {
          this.removeImageryLocation(imgLocIndex);
        },

        // Optional. "preview" (default) is a preview link to the document for sharing,
        // "direct" is an expiring link to download the contents of the file. For more
        // information about link types, see Link types below.
        linkType: "direct",

        // Optional. A value of false (default) limits selection to a single file, while
        // true enables multiple file selection.
        multiselect: true
      });
    }, 1);
  };

  importGDriveClick = () => {
    this.addImageryLocation("gdrive");
    let imgLocIndex = this.props.data["img-loc"].length - 1;
    // Next tick.
    setTimeout(() => {
      gDrive.picker().then(
        files => {
          let gDriveErrFiles = [];
          let validIndex = 0;
          files.forEach(o => {
            if (!o.shared) {
              gDriveErrFiles.push(o.name);
              return;
            }
            if (validIndex === 0) {
              this.onImgLocValueChange(imgLocIndex, "url", o.dlUrl);
            } else {
              this.props.addImageryLocationToScene(this.props.index, "gdrive");
              this.onImgLocValueChange(
                imgLocIndex + validIndex,
                "url",
                o.dlUrl
              );
            }
            validIndex++;
          });
          if (gDriveErrFiles.length) {
            alert(
              `
The following files are not publicly available and can't be used:
- ${gDriveErrFiles.join("\n- ")}

Please check the instructions on how to use files from Google Drive.
            `
            );
          }
        },
        e => {
          this.removeImageryLocation(imgLocIndex);
        }
      );
    }, 1);
  };

  getValueForDate = field => {
    return this.props.data[field] === null
      ? null
      : new Date(this.props.data[field]);
  };

  dateOrUndefined = field => {
    // When getting the value for min/max, if we don't want to set one
    // we need to use undefined.
    // Using null results in the date being the epoch time.
    var val = this.getValueForDate(field);
    return val === null ? undefined : val;
  };

  renderRemoveBtn = () => {
    var classes =
      "bttn-remove-scene" + (this.props.total <= 1 ? " disabled" : "");
    return (
      <div className="form-fieldset-actions">
        <a
          type="button"
          className={classes}
          onClick={this.props.removeScene.bind(null, this.props.index)}
          title="Remove dataset"
        >
          <DeleteIcon />
        </a>
      </div>
    );
  };

  renderImagerySource = i => {
    return (
      <div className="form__group">
        <label className="form-label">Imagery location</label>
        <div className="form__control-set">
          {this.props.data["img-loc"].map((o, imgI) => {
            return (
              <ImageryLocation
                key={o.id}
                onValueChange={this.onImgLocValueChange}
                renderErrorMessage={this.props.renderErrorMessage}
                getValidationMessages={this.props.getValidationMessages}
                handleValidation={this.props.handleValidation}
                removeImageryLocation={this.removeImageryLocation}
                sceneName={this.getName("img-loc")}
                sceneId={this.getId("img-loc")}
                index={imgI}
                validationName={"scenes." + i + ".img-loc"}
                total={this.props.data["img-loc"].length}
                data={o}
              />
            );
          })}
          <div className="imagery-location-import">
            <button
              type="button"
              className="bttn bttn-primary bttn-icon"
              onClick={() => this.addImageryLocation("upload")}
              title="Upload file directly"
            >
              <FileIcon />
              <span>Local File</span>
            </button>
            <button
              type="button"
              className="bttn bttn-primary bttn-icon"
              onClick={() => this.addImageryLocation("manual")}
              title="Write url"
            >
              <LinkVariantIcon />
              <span>Url</span>
            </button>
            <button
              type="button"
              className="bttn bttn-primary bttn-icon"
              onClick={this.importDropboxClick}
              title="Import file from dropbox"
            >
              <DropboxIcon />
              <span>Dropbox</span>
            </button>
            <button
              type="button"
              className="bttn bttn-primary bttn-icon"
              onClick={this.importGDriveClick}
              title="Import file from Google Drive"
            >
              <GoogleDriveIcon />
              <span>Drive</span>
            </button>
            {this.props.renderErrorMessage(
              this.props.getValidationMessages("scenes." + i + ".img-loc")[0]
            )}
            <p className="form-help">
              Select file source location. <br />
              <strong className="accepted-files">
                Only georeferenced TIFF files in natural colors or monochrome
                ones (4 bands or less, 8 bits) are accepted.
              </strong>
              <br />
              Click{" "}
              <a
                href="https://docs.openaerialmap.org/uploader/uploader-form/#via-google-drive"
                title="How to select files from google drive"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>{" "}
              for instructions on how to use Google Drive.
            </p>
          </div>
        </div>
      </div>
    );
  };

  renderContact = () => {
    const isOther = this.props.data["contact-type"] === "other";
    const isUploader = this.props.type === "uploader";

    if (isUploader && !isOther) {
      return null;
    }

    // Just to shorten.
    var i = this.props.index;
    return (
      <div>
        <label
          className="form__label none"
          htmlFor={this.getId("contact-name")}
        >
          <span className="visually-hidden">Contact name</span>
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="Name"
          name={this.getName("contact-name")}
          id={this.getId("contact-name")}
          onBlur={this.props.handleValidation("scenes." + i + ".contact-name")}
          onChange={this.onChange}
          value={this.props.data["contact-name"]}
        />
        {this.props.renderErrorMessage(
          this.props.getValidationMessages("scenes." + i + ".contact-name")[0]
        )}
        <label
          className="form-label none"
          htmlFor={this.getId("contact-email")}
        >
          <span className="visually-hidden">Contact email</span>
        </label>
        <input
          type="email"
          className="form-control"
          placeholder="Email"
          name={this.getName("contact-email")}
          id={this.getId("contact-email")}
          onBlur={this.props.handleValidation("scenes." + i + ".contact-email")}
          onChange={this.onChange}
          value={this.props.data["contact-email"]}
        />
        {this.props.renderErrorMessage(
          this.props.getValidationMessages("scenes." + i + ".contact-email")[0]
        )}
      </div>
    );
  };

  render() {
    // Just to shorten.
    var i = this.props.index;

    return (
      <fieldset className="form-fieldset scene">
        {this.props.type === "uploader" ? this.renderRemoveBtn() : null}
        <div className="form-group">
          <label className="form-label" htmlFor={this.getId("title")}>
            Title
          </label>
          <div className="form-control-set">
            <input
              type="text"
              className="form-control"
              placeholder="Dataset title"
              name={this.getName("title")}
              id={this.getId("title")}
              onBlur={this.props.handleValidation("scenes." + i + ".title")}
              onChange={this.onChange}
              value={this.props.data.title}
            />
            {this.props.renderErrorMessage(
              this.props.getValidationMessages("scenes." + i + ".title")[0]
            )}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Platform</label>
          <div className="form-options-set">
            <div className="radio">
              <label>
                <input
                  type="radio"
                  onChange={this.onChange}
                  name={this.getRadioName("platform-type")}
                  value="satellite"
                  checked={this.props.data["platform-type"] === "satellite"}
                />
                Satellite
              </label>
            </div>
            <div className="radio">
              <label>
                <input
                  type="radio"
                  onChange={this.onChange}
                  name={this.getRadioName("platform-type")}
                  value="aircraft"
                  checked={this.props.data["platform-type"] === "aircraft"}
                />
                Aircraft
              </label>
            </div>
            <div className="radio">
              <label>
                <input
                  type="radio"
                  onChange={this.onChange}
                  name={this.getRadioName("platform-type")}
                  value="uav"
                  checked={this.props.data["platform-type"] === "uav"}
                />
                UAV
              </label>
            </div>
            <div className="radio">
              <label>
                <input
                  type="radio"
                  onChange={this.onChange}
                  name={this.getRadioName("platform-type")}
                  value="ballon"
                  checked={this.props.data["platform-type"] === "ballon"}
                />
                Ballon
              </label>
            </div>
            <div className="radio">
              <label>
                <input
                  type="radio"
                  onChange={this.onChange}
                  name={this.getRadioName("platform-type")}
                  value="kite"
                  checked={this.props.data["platform-type"] === "kite"}
                />
                Kite
              </label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor={this.getId("sensor")}>
            Sensor
          </label>
          <div className="form-control-set">
            <input
              type="text"
              className="form-control"
              placeholder="Type/model"
              name={this.getName("sensor")}
              id={this.getId("sensor")}
              onBlur={this.props.handleValidation("scenes." + i + ".sensor")}
              onChange={this.onChange}
              value={this.props.data.sensor}
              aria-describedby={"help-sensor-" + i}
            />
            {this.props.renderErrorMessage(
              this.props.getValidationMessages("scenes." + i + ".sensor")[0]
            )}
            <p id={"help-sensor-" + i} className="form-help">
              Type or model of image sensor or camera used (ex: Worldview-3).
            </p>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Date start</label>
          <div className="form-control-set">
            <DateTimePicker
              ref="dateStart"
              finalView="decade"
              timeFormat={"HH:mm"}
              value={this.getValueForDate("date-start")}
              onChange={this.onDateChange.bind(null, "date-start")}
            />
            {this.props.renderErrorMessage(
              this.props.getValidationMessages("scenes." + i + ".date-start")[0]
            )}
            <p id={"help-date-start-" + i} className="form-help">
              If the exact start time is unknown using 00:00:00 will suffice.
            </p>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Date end</label>
          <div className="form-control-set">
            <DateTimePicker
              ref="dateEnd"
              min={this.dateOrUndefined("date-start")}
              max={new Date()}
              finalView="decade"
              timeFormat={"HH:mm"}
              value={this.getValueForDate("date-end")}
              onChange={this.onDateChange.bind(null, "date-end")}
            />
            {this.props.renderErrorMessage(
              this.props.getValidationMessages("scenes." + i + ".date-end")[0]
            )}
            <p id={"help-date-end-" + i} className="form-help">
              If the exact end time is unknown using 23:59:59 will suffice.
            </p>
          </div>
        </div>
        {this.props.type === "uploader" ? this.renderImagerySource(i) : null}
        <div className="form-group">
          <label className="form-label" htmlFor={this.getId("tile-url")}>
            Tile service
          </label>
          <div className="form-control-set">
            <input
              type="url"
              className="form-control"
              placeholder="URL (optional)"
              name={this.getName("tile-url")}
              id={this.getId("tile-url")}
              onBlur={this.props.handleValidation("scenes." + i + ".tile-url")}
              onChange={this.onChange}
              value={this.props.data["tile-url"]}
              aria-describedby={"help-tile-" + i}
            />
            {this.props.renderErrorMessage(
              this.props.getValidationMessages("scenes." + i + ".tile-url")[0]
            )}
            <p id={"help-tile-" + i} className="form-help">
              Enter a tile URL template. Valid tokens are{" "}
              {"{z}, {x}, {y} for Z/X/Y, and {u}"} for quadtile scheme.
            </p>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor={this.getId("provider")}>
            Provider
          </label>
          <div className="form-control-set">
            <input
              type="text"
              className="form-control"
              placeholder="Entity name"
              name={this.getName("provider")}
              id={this.getId("provider")}
              onBlur={this.props.handleValidation("scenes." + i + ".provider")}
              onChange={this.onChange}
              value={this.props.data["provider"]}
              aria-describedby={"help-provider-" + i}
            />
            {this.props.renderErrorMessage(
              this.props.getValidationMessages("scenes." + i + ".provider")[0]
            )}
            <p id={"help-provider-" + i} className="form-help">
              Name of company or individual that collected or provided the
              imagery.
            </p>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor={this.getId("tags")}>
            Tags
          </label>
          <div className="form-control-set">
            <input
              type="text"
              className="form-control"
              placeholder="Comma-separated tags"
              name={this.getName("tags")}
              id={this.getId("tags")}
              onBlur={this.props.handleValidation("scenes." + i + ".tags")}
              onChange={this.onChange}
              value={this.props.data["tags"]}
              aria-describedby={"help-tags-" + i}
            />
            {this.props.renderErrorMessage(
              this.props.getValidationMessages("scenes." + i + ".tags")[0]
            )}
            <p id={"help-tags-" + i} className="form-help">
              Any additional metadata tags applicable to the dataset.
            </p>
          </div>
        </div>
        <div className="form-group scene-contact">
          <label className="form-label">Contact</label>
          <div className="form-control-set">
            <div
              className={
                "form-options-set " +
                (this.props.type === "editor" ? "hidden" : "")
              }
            >
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    name={this.getRadioName("contact-type")}
                    onChange={this.onChange}
                    value="uploader"
                    checked={this.props.data["contact-type"] === "uploader"}
                  />
                  Same as uploader
                </label>
              </div>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    name={this.getRadioName("contact-type")}
                    onChange={this.onChange}
                    value="other"
                    checked={this.props.data["contact-type"] === "other"}
                  />
                  Other
                </label>
              </div>
            </div>
            {this.renderContact()}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">License</label>
          <div className="form-options-set">
            <div className="radio">
              <label>
                <input
                  type="radio"
                  name={this.getRadioName("license")}
                  onChange={this.onChange}
                  value="CC-BY 4.0"
                  checked={this.props.data["license"] === "CC-BY 4.0"}
                />
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC-BY 4.0
                </a>
              </label>
            </div>
            <div className="radio">
              <label>
                <input
                  type="radio"
                  name={this.getRadioName("license")}
                  onChange={this.onChange}
                  value="CC BY-NC 4.0"
                  checked={this.props.data["license"] === "CC BY-NC 4.0"}
                />
                <a
                  href="https://creativecommons.org/licenses/by-nc/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC BY-NC 4.0
                </a>
              </label>
            </div>
            <div className="radio">
              <label>
                <input
                  type="radio"
                  name={this.getRadioName("license")}
                  onChange={this.onChange}
                  value="CC BY-SA 4.0"
                  checked={this.props.data["license"] === "CC BY-SA 4.0"}
                />
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC BY-SA 4.0
                </a>
              </label>
            </div>
          </div>
        </div>
      </fieldset>
    );
  }
}
