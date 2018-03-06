import PropTypes from "prop-types";
import React from "react";
import moment from "moment";
import StatusImage from "./StatusImage";

function dateFormat(date) {
  // http://momentjs.com/docs/#/displaying/
  return moment(date).format("YYYY-M-D [at] H:mm");
}

const StatusScene = props => {
  const { scene } = props;
  const images = scene.images.map((image, index) => {
    return <StatusImage image={image} index={index} />;
  });
  return (
    <section key={scene._id} className="panel status-panel">
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
        {images}
      </div>
      <footer className="panel-footer" />
    </section>
  );
};

StatusScene.propTypes = {
  scene: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    acquisition_start: PropTypes.string.isRequired,
    acquisition_end: PropTypes.string.isRequired,
    platform: PropTypes.string.isRequired,
    provider: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    images: PropTypes.array.isRequired
  }).isRequired
};

export default StatusScene;
