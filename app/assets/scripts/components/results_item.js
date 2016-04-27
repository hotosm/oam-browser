'use strict';
var qs = require('querystring');
var $ = require('jquery');
var centroid = require('turf-centroid');
var React = require('react/addons');
var Keys = require('react-keybinding');
var Router = require('react-router');
var actions = require('../actions/actions');
var ZcButton = require('./shared/zc_button');
var Dropdown = require('./shared/dropdown');
var utils = require('../utils/utils');
var prettyBytes = require('pretty-bytes');

var ResultsItem = React.createClass({
  displayName: 'ResultsItem',

  propTypes: {
    pagination: React.PropTypes.object,
    data: React.PropTypes.object
  },

  mixins: [
    Keys,
    Router.State,
    Router.Navigation
  ],

  keybindings: {
    'arrow-left': function () {
      if (this.props.pagination.prevId) {
        this.prevResult(null);
      }
    },
    'arrow-right': function () {
      if (this.props.pagination.nextId) {
        this.nextResult(null);
      }
    }
  },

  prevResult: function (e) {
    if (e) {
      e.preventDefault();
    }
    var p = this.getParams();
    this.transitionTo('item', {
      map: p.map,
      square: p.square,
      item_id: this.props.pagination.prevId
    }, this.getQuery());
  },

  viewAllResults: function (e) {
    if (e) {
      e.preventDefault();
    }
    var p = this.getParams();
    this.transitionTo('results', {
      map: p.map,
      square: p.square
    }, this.getQuery());
  },

  nextResult: function (e) {
    if (e) {
      e.preventDefault();
    }
    var p = this.getParams();
    this.transitionTo('item', {
      map: p.map,
      square: p.square,
      item_id: this.props.pagination.nextId
    }, this.getQuery());
  },

  onCopy: function (e) {
    return $(e.target).parents('.input-group').find('[data-hook="copy:data"]').val();
  },

  onOpenJosm: function (tmsUrl) {
    var d = this.props.data;
    var source = 'OpenAerialMap - ' + d.provider + ' - ' + d.uuid;
    // Reference:
    // http://josm.openstreetmap.de/wiki/Help/Preferences/RemoteControl#load_and_zoom
    $.get('http://127.0.0.1:8111/load_and_zoom?' + qs.stringify({
      left: d.bbox[0],
      right: d.bbox[2],
      bottom: d.bbox[1],
      top: d.bbox[3],
      source: source
    }))
    .success(function (data) {
      // Reference:
      // http://josm.openstreetmap.de/wiki/Help/Preferences/RemoteControl#imagery
      // Note: `url` needs to be the last parameter.
      $.get('http://127.0.0.1:8111/imagery?' + qs.stringify({
        type: 'tms',
        title: source
      }) + '&url=' + tmsUrl)
      .success(function () {
        // all good!
        actions.openModal('message', {
          title: 'Success',
          message: 'This scene has been loaded into JOSM.'
        });
      });
    })
    .fail(function (err) {
      console.error(err);
      actions.openModal('message', {
        title: 'Error',
        message: <p>Could not connect to JOSM via Remote Control.  Is JOSM configured to allow <a href='https://josm.openstreetmap.de/wiki/Help/Preferences/RemoteControl' target='_blank'>remote control</a>?</p>
      });
    });
  },

  renderTmsOptions: function (tmsUrl, dropClass) {
    var d = this.props.data;
    // Generate the iD URL:
    // grab centroid of the footprint
    var center = centroid(d.geojson).geometry.coordinates;
    // cheat by using current zoom level
    var zoom = this.getParams().map.split(',')[2];
    var idUrl = 'http://www.openstreetmap.org/edit' +
    '#map=' + [zoom, center[1], center[0]].join('/') +
    '?' + qs.stringify({
      editor: 'id',
      background: 'custom:' + tmsUrl
    });

    return (
      <div className='input-group'>
        <input className='form-control input-m' type='text' value={tmsUrl} readOnly data-hook='copy:data' />
        <Dropdown element='span' className={'input-group-bttn ' + dropClass} triggerTitle='Show options' triggerClassName='bttn-uoptions' triggerText='Options'>
          <ul className='drop-menu tms-options-menu' role='menu'>
            <li className='has-icon-bef id-editor'><a href={idUrl} target='_blank' title='Open with iD editor'>Open with iD editor</a></li>
            <li className='has-icon-bef josm'><a onClick={this.onOpenJosm.bind(null, tmsUrl)} title='Open with JOSM'>Open with JOSM</a></li>
            <li className='has-icon-bef clipboard'>
              <ZcButton onCopy={this.onCopy} title='Copy to clipboard' text='Copy to clipboard'/>
            </li>
          </ul>
        </Dropdown>
      </div>
    );
  },

  render: function () {
    var d = this.props.data;
    var pagination = this.props.pagination;

    var tmsOptions = d.properties.tms ? this.renderTmsOptions(d.properties.tms, 'dropdown center') : null;

    var blurImage = {
      backgroundImage: 'url(' + d.properties.thumbnail + ')'
    };

    return (
      <article className={(d.properties.tms ? 'has-tms ' : '') + 'results-single'}>
        <header className='pane-header'>
          <h1 className='pane-title' title={d.title.replace(/\.[a-z]+$/, '')}>{d.title.replace(/\.[a-z]+$/, '')}</h1>
          <p className='pane-subtitle'>{pagination.current} of {pagination.total} results</p>
        </header>
        <div className='pane-body'>
          <div className='pane-body-inner'>
            <div className='single-media'>
              <div className='blur-media' style={blurImage}></div>
              <img alt='Result thumbnail' src={d.properties.thumbnail || 'assets/graphics/layout/img-placeholder.svg' } />
            </div>
            <div className='single-actions'>
              {tmsOptions}
              <a title='Download image' className='bttn-download' target='_blank' href={d.uuid}><span>Download</span></a>
            </div>
            <dl className='single-details'>
              <dt><span>Date</span></dt>
              <dd>{d.acquisition_start ? d.acquisition_start.slice(0, 10) : 'N/A'}</dd>
              <dt><span>Resolution</span></dt>
              <dd>{utils.gsdToUnit(d.gsd)}</dd>
              <dt><span>Type</span></dt>
              <dd>{d.properties.tms ? 'Image + Map Layer' : 'Image'}</dd>
              <dt><span>Image Size</span></dt>
              <dd className='cap'>{prettyBytes(d.file_size)}</dd>
              <dt><span>Platform</span></dt>
              <dd className='cap'>{d.platform}</dd>
              <dt><span>Sensor</span></dt>
              <dd className='cap'>{d.properties.sensor ? d.properties.sensor : 'not available'}</dd>
              <dt><span>Provider</span></dt>
              <dd className='cap'>{d.provider}</dd>
            </dl>

            {d.custom_tms ? (
            <section className='single-related-tms'>
              <header>
                <h1>Available map layers</h1>
                <p>This image is part of the folowing map layers:</p>
              </header>
              <ul>
                {d.custom_tms.map(function (o, i) {
                  return <li key={i}>{this.renderTmsOptions(o, 'dropup right')}</li>;
                }.bind(this))}
              </ul>
            </section>
            ): null}

          </div>
        </div>
        <footer className='pane-footer'>
          <ul className='single-pager'>
            <li className='view-all'><a href='#' onClick={this.viewAllResults} title='View all results'><span>All</span></a></li>
            <li className='view-prev'><a href='#' onClick={this.prevResult} className={this.props.pagination.prevId ? '' : 'disabled'} title='View previous result'><span>Prev</span></a></li>
            <li className='view-next'><a href='#' onClick={this.nextResult} className={this.props.pagination.nextId ? '' : 'disabled'} title='View next result'><span>Next</span></a></li>
          </ul>
        </footer>
      </article>
    );
  }
});

module.exports = ResultsItem;
