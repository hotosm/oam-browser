'use strict';
var qs = require('querystring');
var $ = require('jquery');
var React = require('react/addons');
var Keys = require('react-keybinding');
var Router = require('react-router');
var actions = require('../actions/actions');
var ZcButton = require('./shared/zc_button');
var Dropdown = require('./shared/dropdown');
var utils = require('../utils/utils');


var ResultsItem = React.createClass({
  mixins: [
    Keys,
    Router.State
  ],

  keybindings: {
    'arrow-left': function() {
      if (this.props.pagination.current > 1) {
        actions.prevResult();
      }
    },
    'arrow-right': function() {
      if (this.props.pagination.current < this.props.pagination.total) {
        actions.nextResult();
      }
    }
  },

  prevResult: function(e) {
    e.preventDefault();
    actions.prevResult();
  },
  viewAllResults: function(e) {
    e.preventDefault();
    actions.resultListView();
  },
  nextResult: function(e) {
    e.preventDefault();
    actions.nextResult();
  },

  onCopy: function(e) {
    return this.getDOMNode().querySelector('[data-hook="copy:data"]').value;
  },

  onOpenJosm: function(d) {
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
      }) + '&url=' + d.properties.tms)
      .success(function () {
        // all good!
        // TODO: feedback to user.
      });
    })
    .fail(function () {
      // TODO: message to user, indicating there was an error using JSOM RemoteControl
    });
  },

  render: function() {
    var d = this.props.data;
    var pagination = this.props.pagination;

    var isFirst = pagination.current == 1;
    var isLast = pagination.current == pagination.total;

    var tmsOptions = null;
    if (d.properties.tms) {
      // Generate the iD URL:
      // grab centroid of the footprint
      var centroid = turf.centroid(d.geojson).geometry.coordinates;
      // cheat by using current zoom level
      var zoom = this.getParams().map.split(',')[2]
      var idUrl = 'http://www.openstreetmap.org/edit' +
      '#map=' + [zoom, centroid[1], centroid[0]].join('/') +
      '?' + qs.stringify({
        editor: 'id',
        background: 'custom:' + d.properties.tms
      });

      tmsOptions = (
        <div className="input-group">
          <input className="form-control input-m" type="text" value={d.properties.tms} readOnly  data-hook="copy:data" />
          <Dropdown element="span" className="input-group-bttn dropdown center" triggerTitle="Show options" triggerClassName="bttn-uoptions" triggerText="Options">
            <ul className="drop-menu tms-options-menu" role="menu">
              <li className="has-icon-bef id-editor"><a href={idUrl} target="_blank" title="Open with iD editor">Open with iD editor</a></li>
              <li className="has-icon-bef josm"><a onClick={this.onOpenJosm.bind(this, d)} title="Open with JOSM">Open with JOSM</a></li>
              <li className="has-icon-bef clipboard">
                <ZcButton onCopy={this.onCopy} title="Copy to clipboard" text="Copy to clipboard"/>
              </li>
            </ul>
          </Dropdown>
        </div>
      );
    }

    var blurImage = {
      backgroundImage: 'url(' + d.properties.thumbnail + ')'
    };

    return (
      <article className={(d.properties.tms ? 'has-tms ' : '') + 'results-single'}>
        <header className="pane-header">
          <h1 className="pane-title" title={d.title.replace(/\.[a-z]+$/, '')}>{d.title.replace(/\.[a-z]+$/, '')}</h1>
          <p className="pane-subtitle">{pagination.current} of {pagination.total} results</p>
        </header>
        <div className="pane-body">
          <div className="pane-body-inner">
            <div className="single-media">
              <div className="blur-media" style={blurImage}></div>
              <img alt="Result thumbnail" src={d.properties.thumbnail || "assets/graphics/layout/img-placeholder.svg" } />
            </div>
            <div className="single-actions">
              {tmsOptions}
              <a title="Download image" className="bttn-download" target="_blank" href={d.uuid}><span>Download</span></a>
            </div>
            <dl className="single-details">
              <dt><span>Type</span></dt>
              <dd>{d.properties.tms ? 'Multiscene TMS' : 'Single Scene'}</dd>
              <dt><span>Date</span></dt>
              <dd>{d.acquisition_start.slice(0,10)}</dd>
              <dt><span>Resolution</span></dt>
              <dd>{utils.gsdToUnit(d.gsd)}</dd>
              <dt><span>Platform</span></dt>
              <dd className="cap">{d.platform}</dd>
            </dl>
          </div>
        </div>
        <footer className="pane-footer">
          <ul className="single-pager">
            <li className="view-all"><a href="#" onClick={this.viewAllResults} title="View all results"><span>All</span></a></li>
            <li className="view-prev"><a href="#" onClick={this.prevResult} className={isFirst ? 'disabled' : ''} title="View previous result"><span>Prev</span></a></li>
            <li className="view-next"><a href="#" onClick={this.nextResult} className={isLast ? 'disabled' : ''} title="View next result"><span>Next</span></a></li>
          </ul>
        </footer>
      </article>
    );
  }
})

module.exports = ResultsItem;
