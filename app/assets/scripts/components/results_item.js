'use strict';
var React = require('react/addons');
var actions = require('../actions/actions');
var ZcButton = require('./shared/zc_button');
var Dropdown = require('./shared/dropdown');
var utils = require('../utils/utils');


var ResultsItem = React.createClass({
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

  render: function() {
    var d = this.props.data;
    var pagination = this.props.pagination;

    var isFirst = pagination.current == 1;
    var isLast = pagination.current == pagination.total;

    var tmsOptions = null;
    if (d.properties.tms) {
      tmsOptions = (
        <div className="input-group">
          <input className="form-control input-m" type="text" value={d.properties.tms} readOnly  data-hook="copy:data" />
          <Dropdown element="span" className="input-group-bttn dropdown center" triggerTitle="Show options" triggerClassName="bttn-uoptions" triggerText="Options">
            <ul className="drop-menu tms-options-menu" role="menu">
              <li className="has-icon-bef clipboard disabled"><a href="" target="_blank" title="Open with iD editor">Open with iD editor</a></li>
              <li className="has-icon-bef clipboard disabled"><a href="" target="_blank" title="Open with JOSM">Open with JOSM</a></li>
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
          <h1 className="pane-title" title="{d.title}">{d.title}</h1>
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