import PropTypes from "prop-types";
import React from "react";
import moment from "moment";
import classNames from "classnames";
import utils from "utils/utils";

function dateFormat(date) {
  // http://momentjs.com/docs/#/displaying/
  return moment(date).format("YYYY-M-D [at] H:mm");
}

function imageClick(event, metadata) {
  event.preventDefault();
  const modifiedMetdata = Object.assign({}, metadata);
  modifiedMetdata._id = metadata.uuid.split("/").slice(-1)[0];
  utils.imageUri(modifiedMetdata);
}

const imgStatusMatrix = {
  initial: "Pending",
  processing: "Processing",
  finished: "Finished",
  errored: "Errored"
};

function getMessageList(image) {
  let messages;
  if (image.messages) {
    messages = image.messages.map((message, index) => {
      if (message.status === "failed")
        return (
          <div className="failed-message" key={index}>
            {message.message}
          </div>
        );

      return <div key={message.message}>{message.message}</div>;
    });
  } else {
    messages = [];
  }
  return messages;
}

function getStatusMessage(image) {
  let statusMessage;
  if (image.status === "finished") {
    statusMessage = (
      <div>
        <a
          onClick={event => imageClick(event, image.metadata)}
          title="View image on OpenAerialMap"
          className="bttn-view-image"
        >
          View image
        </a>
      </div>
    );
  } else if (image.status === "processing") {
    statusMessage = <div>Upload in progress.</div>;
  } else if (image.status === "errored") {
    statusMessage = (
      <div>
        <strong className="failed-message">Upload failed</strong>
        {image.error ? image.error.message : ""}
      </div>
    );
  }
  return statusMessage;
}

const StatusImage = props => {
  const { image, index } = props;
  const messages = getMessageList(image);
  const statusMessage = getStatusMessage(image);
  const imageClass = classNames({
    "image-block": true,
    "status-success": image.status === "finished",
    "status-processing": image.status === "processing",
    "status-error": image.status === "errored"
  });

  const statusClass = classNames({
    status: true,
    "status-success": image.status === "finished",
    "status-processing": image.status === "processing",
    "status-error": image.status === "errored"
  });

  return (
    <div key={image._id} className={imageClass}>
      <h2 className="image-block-title">Image {index}</h2>
      <dl className="status-details">
        <dt>Started</dt>
        <dd>{dateFormat(image.startedAt)}</dd>
        {image.stoppedAt
          ? [
              <dt key="finished">
                {image.status === "finished" ? "Finished" : "Stopped"}
              </dt>,
              <dd key="finisedDate">{dateFormat(image.stoppedAt)}</dd>
            ]
          : ""}
        <dt>Status</dt>
        <dd>
          <div className={statusClass}>
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
        <dd>{statusMessage}</dd>
        <div className="status-info">
          <div className="steps">
            <div>{messages}</div>
          </div>
        </div>
      </dl>
    </div>
  );
};

StatusImage.propTypes = {
  image: PropTypes.shape({
    status: PropTypes.string.isRequired,
    metadata: PropTypes.object.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired
};

export default StatusImage;
