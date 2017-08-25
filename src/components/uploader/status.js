import { Router } from 'react-router';
import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import moment from 'moment';
import util from 'util';
import url from 'url';
import nets from 'nets';
import config from 'config';

import utils from 'utils/utils';

const apiUrl = config.catalog.url;

function dateFormat (date) {
  // http://momentjs.com/docs/#/displaying/
  return moment(date).format('YYYY-M-D [at] H:mm');
}

export default createReactClass({
  displayName: 'Status',

  propTypes: {
    params: PropTypes.object,
    query: PropTypes.object
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
      var url = utils.imageUri(imgData);

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
