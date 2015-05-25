'use strict';

var React = require('react/addons');
var Reflux = require('reflux');
var actions = require('../../actions/actions');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var BModal = React.createClass({
  getDefaultProps: function() {
    return {
      header: null,
      body: null,
      footer: null,

      revealed: false,

      onOverlayClick: function(e) { e.preventDefault(); },
      onCloseClick: function(e) { e.preventDefault(); },
    }
  },

  render: function () {
    var modal = null;
    if (this.props.revealed) {
      modal = (
        <section className="modal" key="modal" onClick={this.props.onOverlayClick} >
          <div className="modal-inner">
            <a className="close" title="Close" onClick={this.props.onCloseClick}><span>Close</span></a>
            <header className="modal-header">
              {this.props.header}
            </header>
            <div className="modal-body">
              {this.props.body}
            </div>
            <footer className="modal-footer">
              {this.props.footer}
            </footer>
          </div>
        </section>
      );
    }

    return (
      <ReactCSSTransitionGroup component="div" transitionAppear={true} transitionName="modal">
        {modal}
      </ReactCSSTransitionGroup>
    );
  }
});

module.exports = BModal;  