'use strict';

var React = require('react/addons');
var Reflux = require('reflux');
var BModal = require('./base_modal');
var actions = require('../../actions/actions');

var InfoModal = React.createClass({
  mixins: [
    Reflux.listenTo(actions.openModal, 'onOpenModal'),
  ],

  getInitialState: function() {
    return {
      revealed: false
    };
  },

  onOpenModal: function(which) {
    if (which == 'info') {
      this.setState({ revealed: true });
    }
  },

  getHeader: function() {
    return <h1 className="modal-title">Modal title</h1>
  },
  getBody: function() {
    return 'body';
  },
  getFooter: function() {
    return 'footer';
  },

  onCloseClick: function(e) {
    e.preventDefault();
    this.setState({ revealed: false });
  },

  onOverlayClick: function(e) {
    e.preventDefault();
    console.log(e);
    // Prevent children from triggering this.
    if(e.target === e.currentTarget) {
      this.setState({ revealed: false });
    }
  },

  render: function () {
    return (
      <BModal
        header={this.getHeader()}
        body={this.getBody()}
        footer={this.getFooter()}
        revealed={this.state.revealed}
        onCloseClick={this.onCloseClick}
        onOverlayClick={this.onOverlayClick} />
    );
  }
});

module.exports = InfoModal;  