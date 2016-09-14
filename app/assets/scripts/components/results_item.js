'use strict';
import { hashHistory } from 'react-router';
import React from 'react';
import qs from 'querystring';
import $ from 'jquery';
import centroid from 'turf-centroid';
import Keys from 'react-keybinding';
import actions from '../actions/actions';
import ZcButton from './shared/zc_button';
import { Dropdown } from 'oam-design-system';
import utils from '../utils/utils';
import prettyBytes from 'pretty-bytes';

var ResultsItem = React.createClass({
  displayName: 'ResultsItem',

  propTypes: {
    query: React.PropTypes.object,
    mapView: React.PropTypes.string,
    selectedSquareQuadkey: React.PropTypes.string,
    pagination: React.PropTypes.object,
    data: React.PropTypes.object
  },

  mixins: [
    Keys
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

  getInitialState: function () {
    return {
      selectedPreview: 'thumbnail'
    };
  },

  onPreviewSelect: function (what) {
    actions.selectPreview(what);
    let selected = what.type;
    if (what.index !== undefined) {
      selected += `-${what.index}`;
    }
    this.setState({selectedPreview: selected});
  },

  prevResult: function (e) {
    if (e) {
      e.preventDefault();
    }
    let { mapView, selectedSquareQuadkey } = this.props;
    let path = `${mapView}/${selectedSquareQuadkey}/${this.props.pagination.prevId}`;
    hashHistory.push({pathname: path, query: this.props.query});
  },

  viewAllResults: function (e) {
    if (e) {
      e.preventDefault();
    }
    let { mapView, selectedSquareQuadkey } = this.props;
    let path = `${mapView}/${selectedSquareQuadkey}`;
    hashHistory.push({pathname: path, query: this.props.query});
  },

  nextResult: function (e) {
    if (e) {
      e.preventDefault();
    }
    let { mapView, selectedSquareQuadkey } = this.props;
    let path = `${mapView}/${selectedSquareQuadkey}/${this.props.pagination.nextId}`;
    hashHistory.push({pathname: path, query: this.props.query});
  },

  onCopy: function (key, trigger) {
    // Close the dropdown.
    this.refs[`tms-drop-${key}`].close();
    // Return the copy text.
    return this.refs[`tms-url-${key}`].value;
  },

  onOpenJosm: function (dropKey, tmsUrl) {
    // Close the dropdown.
    this.refs[`tms-drop-${dropKey}`].close();

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
          message: <p>This scene has been loaded into JOSM.</p>
        });
      });
    })
    .fail(function (err) {
      console.error(err);
      actions.openModal('message', {
        title: 'Error',
        message: (
          <div>
            <p>Could not connect to JOSM via Remote Control.</p>
            <p>Is JOSM configured to allow <a href='https://josm.openstreetmap.de/wiki/Help/Preferences/RemoteControl' target='_blank'>remote control</a>?</p>
          </div>
        )
      });
    });
  },

  renderTmsOptions: function (tmsUrl, key, direction, aligment) {
    var d = this.props.data;
    // Generate the iD URL:
    // grab centroid of the footprint
    var center = centroid(d.geojson).geometry.coordinates;
    // cheat by using current zoom level
    var zoom = this.props.mapView.split(',')[2];
    var idUrl = 'http://www.openstreetmap.org/edit' +
    '#map=' + [zoom, center[1], center[0]].join('/') +
    '?' + qs.stringify({
      editor: 'id',
      background: 'custom:' + tmsUrl
    });

    let prevSelectClass = this.state.selectedPreview === `tms-${key}` ? 'button--active' : '';

    return (
      <div className='form__group'>
        <label className='form__label' htmlFor='tms-url'>TMS url</label>
        <div className='form__input-group'>
          <input className='form__control form__control--medium' type='text' value={tmsUrl} readOnly ref={`tms-url-${key}`} />
          <span className='form__input-group-button'>
            <Dropdown
              className='drop__content--tms-options'
              triggerElement='button'
              triggerClassName='button-tms-options'
              triggerActiveClassName='button--active'
              triggerTitle='Show options'
              triggerText='Options'
              direction={direction}
              alignment={aligment}
              ref={`tms-drop-${key}`} >

              <ul className='drop__menu drop__menu--iconified tms-options-menu' role='menu'>
                <li><a className='drop__menu-item ide' href={idUrl} target='_blank' title='Open with iD editor'>Open with iD editor</a></li>
                <li><a className='drop__menu-item josm' onClick={this.onOpenJosm.bind(null, key, tmsUrl)} title='Open with JOSM'>Open with JOSM</a></li>
                <li><ZcButton onCopy={this.onCopy.bind(null, key)} title='Copy to clipboard' text='Copy to clipboard' /></li>
              </ul>
            </Dropdown>
          </span>
        </div>
        <button className={'button--tms-preview ' + prevSelectClass} type='button' onClick={this.onPreviewSelect.bind(null, {type: 'tms', index: key})} title='Preview TMS on map'><span>preview</span></button>
      </div>
    );
  },

  render: function () {
    var d = this.props.data;
    var pagination = this.props.pagination;

    var tmsOptions = d.properties.tms ? this.renderTmsOptions(d.properties.tms, 'main', 'down', 'center') : null;

    var blurImage = {
      backgroundImage: 'url(' + d.properties.thumbnail + ')'
    };

    let sp = this.state.selectedPreview;

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
              <a title='Download image' className='button-download' target='_blank' href={d.uuid}><span>Download</span></a>

              <div className='preview-options'>
                <h3 className='preview-options__title'>Preview</h3>
                <div className='button-group button-group--horizontal preview-options__buttons' role='group'>
                  <button className={'button button--small button--display ' + (sp === 'thumbnail' ? 'button--active' : '') } type='button' onClick={this.onPreviewSelect.bind(null, {type: 'thumbnail'})}><span>Thumbnail</span></button>
                  {d.properties.tms ? <button className={'button button--small button--display ' + (sp === 'tms' ? 'button--active' : '') } type='button' onClick={this.onPreviewSelect.bind(null, {type: 'tms'})}><span>TMS</span></button> : null}
                  <button className={'button button--small button--display ' + (sp === 'none' ? 'button--active' : '') } type='button' onClick={this.onPreviewSelect.bind(null, {type: 'none'})}><span>None</span></button>
                </div>
              </div>
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
                <p>This image is part of the following map layers:</p>
              </header>
              <ul>
                {d.custom_tms.map(function (o, i) {
                  return <li key={i}>{this.renderTmsOptions(o, i, 'up', 'right')}</li>;
                }.bind(this))}
              </ul>
            </section>
            ) : null}

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
