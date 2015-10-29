'use strict';
var React = require('react/addons');
var Reflux = require('reflux');
var BModal = require('./base_modal');
var actions = require('../../actions/actions');

var MessageModal = React.createClass({
  mixins: [
    Reflux.listenTo(actions.openModal, 'onOpenModal')
  ],

  getInitialState: function () {
    return {
      title: 'Message',
      message: ''
    };
  },

  onOpenModal: function (which, data) {
    if (which === 'message' && data) {
      this.setState(data);
    }
  },

  getHeader: function () {
    return (<h1 className='modal-title'>{this.state.title}</h1>);
  },

  getBody: function () {
    return (
      <div className='message'>
        {this.state.message}
      </div>
    );
  },

  getFooter: function () {
    return false;
  },

  render: function () {
    return (
      <BModal
        type='message'
        header={this.getHeader()}
        body={this.getBody()}
        footer={this.getFooter()}
        revealed={false} />
    );
  }
});

module.exports = MessageModal;
