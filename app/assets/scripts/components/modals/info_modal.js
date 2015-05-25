'use strict';

var React = require('react/addons');
var Reflux = require('reflux');
var BModal = require('./base_modal');

var InfoModal = React.createClass({
  getHeader: function() {
    return (<h1 className="modal-title">Modal title</h1>);
  },

  getBody: function() {
    return (<p>Modal body</p>);
  },

  getFooter: function() {
    return (<p>Modal footer</p>);
  },

  render: function () {
    return (
      <BModal
        type="info"
        header={this.getHeader()}
        body={this.getBody()}
        footer={this.getFooter()} />
    );
  }
});

module.exports = InfoModal;  