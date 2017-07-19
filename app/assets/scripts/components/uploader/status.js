'use strict';
var Router = require('react-router');
var React = require('react');
var moment = require('moment');
var turfCentroid = require('turf-centroid');
var parse = require('wellknown');
var tilebelt = require('tilebelt');

var util = require('util');
var url = require('url');
var nets = require('nets');
var apiUrl = require('../../config.js').catalog.url;
var browserUrl = require('../../config.js').OAMBrowserUrl;

function dateFormat (date) {
  // http://momentjs.com/docs/#/displaying/
  return moment(date).format('YYYY-M-D [at] H:mm');
}

// Use image metadata to construct OAM Browser URL describing the map view,
// associated grid tile. Image ID is not available since it has not been indexed,
// by the Catalog yet
// adapted from "https://github.com/hotosm/openaerialmap.org/blob/master/app/assets/scripts/main.js#L36-L50
const constructUrl = (imgData) => {
  const previewZoom = 10;
  // Use turf to calculate the center of the image
  const footprint = parse(imgData.footprint);
  const center = turfCentroid(footprint).geometry.coordinates;

  // Calculate the tile quadkey for the image using Mapbox tilebelt
  // * a square at zoom Z is the same as a map tile at zoom Z+3 (previewZoom)
  const tile = tilebelt.pointToTile(center[0], center[1], previewZoom + 3);
  const quadKey = tilebelt.tileToQuadkey(tile);
  const mapView = center[0] + ',' + center[1] + ',' + previewZoom;
  // Return OAM Browser URL including map view, tile, and image id
  return `${browserUrl}/#/${mapView}/${quadKey}/`;
};

module.exports = React.createClass({
  displayName: 'Status',

  propTypes: {
    params: React.PropTypes.object,
    query: React.PropTypes.object
  },

  mixins: [Router.State],

  getInitialState: function () {
    return {
      loading: true
    };
  },

  componentWillMount: function () {
    var id = this.props.params.id;
    nets(url.resolve(apiUrl, '/uploads/' + id), function (err, resp, body) {
      if (err) {
        return this.setState({
          loading: false,
          errored: true,
          message: err.message,
          data: err
        });
      }

      try {
        var data = JSON.parse(body.toString());
        this.setState({
          loading: false,
          errored: resp.statusCode < 200 || resp.statusCode >= 400,
          message: 'API responded with ' + resp.statusCode,
          data: data.results
        });
      } catch (err) {
        console.error(err);
        return this.setState({
          loading: false,
          errored: true,
          message: 'Error parsing API response; statusCode: ' + resp.statusCode,
          data: '' + body
        });
      }
    }.bind(this));
  },

  renderScene: function (scene) {
    return (
      <section className='panel status-panel'>
        <header className='panel-header'>
          <div className='panel-headline'>
            <h1 className='panel-title'>Dataset: <span className='given-title'>{scene.title}</span></h1>
          </div>
        </header>
        <div className='panel-body'>
          <dl className='status-details'>
            <dt>Platform</dt>
            <dd>{scene.platform}</dd>
            <dt>Sensor</dt>
            <dd>{scene.sensor || ''}</dd>
            <dt>Provider</dt>
            <dd>{scene.provider}</dd>
            <dt>Acquisition Date</dt>
            <dd>{dateFormat(scene.acquisition_start)} - {dateFormat(scene.acquisition_end)}</dd>
            { scene.tms ? [
              <dt>Tile service</dt>,
              <dd>{scene.tms}</dd>
            ] : '' }
            { scene.contact ? [
              <dt>Contact</dt>,
              <dd>
                <span className='name'>
                  {scene.contact.name}
                </span>
                <span className='email'>
                  {scene.contact.email}
                </span>
              </dd>
            ] : '' }
          </dl>

          {scene.images.map(this.renderImage)}

        </div>
        <footer className='panel-footer'></footer>
      </section>
    );
  },

  renderImage: function (image, i) {
    var status;
    var messages = (image.messages || []).map(function (msg) { return <li>{msg}</li>; });
    if (image.status === 'finished') {
      var imgData = image.metadata;
      var url = constructUrl(imgData);

      status = 'status-success';
      messages.unshift(
        <li>
          <a href={url} title='View image on OpenAerialMap' className='bttn-view-image'>
            View image
          </a>
        </li>
      );
    } else if (image.status === 'processing') {
      status = 'status-processing';
      messages.unshift(<li>Upload in progress.</li>);
    } else if (image.status === 'errored') {
      status = 'status-error';
      messages.unshift(<li><strong>Upload failed: </strong> {image.error.message}</li>);
    }

    status = ' ' + status + ' ';

    var imgStatusMatrix = {
      'initial': 'Pending',
      'processing': 'Processing',
      'finished': 'Finished',
      'errored': 'Errored'
    };

    return (
      <div className={'image-block' + status}>
        <h2 className='image-block-title'>Image {i}</h2>
        <p className={'status' + status}>{imgStatusMatrix[image.status]}</p>
        <dl className='status-details'>
          <dt>Started</dt>
          <dd>{dateFormat(image.startedAt)}</dd>
          { image.stoppedAt ? [
            <dt>{image.status === 'finished' ? 'Finished' : 'Stopped'}</dt>,
            <dd>{dateFormat(image.stoppedAt)}</dd>
          ] : '' }
          <dt>Info</dt>
          <dd className='info-detail'>
            <ul>{messages}</ul>
          </dd>
        </dl>
      </div>
    );
  },

  render: function () {
    if (this.state.loading) {
      return (<div><h1>Loading...</h1></div>);
    }

    if (this.state.errored) {
      return (
        <div className='intro-block'>
          <h2>Status upload</h2>
          <p>There was an error: {this.state.message}.</p>
          <pre>{util.inspect(this.state.data)}</pre>
        </div>
      );
    }

    var data = this.state.data;

    return (
      <div>

        <div className='intro-block'>
          <h2>Status upload</h2>
        </div>

        <section className='panel status-panel'>
          <header className='panel-header'>
            <div className='panel-headline'>
              <h1 className='panel-title'>General</h1>
            </div>
          </header>
          <div className='panel-body'>
            <dl className='status-details'>
              <dt>Date</dt>
              <dd>{dateFormat(data.createdAt)}</dd>
            </dl>
          </div>
          <footer className='panel-footer'></footer>
        </section>

        {data.scenes.map(function (scene) { return this.renderScene(scene); }.bind(this))}

      </div>
    );
  }
});
