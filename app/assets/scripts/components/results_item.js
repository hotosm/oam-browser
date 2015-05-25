'use strict';
var React = require('react/addons');
var actions = require('../actions/actions');

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

  render: function() {
    var d = this.props.data;
    var pagination = this.props.pagination;

    var isFirst = pagination.current == 1;
    var isLast = pagination.current == pagination.total;

    var useImage = null;
    if (true) {
      useImage = (<a title="Download image" className="bttn-download"><span>Download</span></a>);
    }
    else {
      useImage = (
        <div className="input-group">
          <input className="form-control input-m" type="text" value="http://openaerialmap.org/" readOnly />
          <span className="input-group-bttn"><button type="button" title="Copy URL to clipboard" className="bttn-clipboard"><span>Copy to clipboard</span></button></span>
        </div>
      );
    }

    return (
      <article className="results-single">
        <header className="pane-header">
          <h1 className="pane-title" title="{d.title}">{d.title}</h1>
          <p className="pane-subtitle">{pagination.current} of {pagination.total} results</p>
        </header>
        <div className="pane-body">
          <div className="pane-body-inner">
            <div className="single-media">
              <img alt="Result thumbnail" src="/assets/graphics/layout/img-placeholder.svg" />
            </div>
            <div className="single-actions">
              {useImage}
            </div>
            <dl className="single-details">
              <dt>Type</dt>
              <dd>Multiscene TMS</dd>
              <dt>Date</dt>
              <dd>2015-05-18</dd>
              <dt>Res</dt>
              <dd>50 cm</dd>
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