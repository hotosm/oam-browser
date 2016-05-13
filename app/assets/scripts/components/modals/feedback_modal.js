'use strict';
var React = require('react/addons');
var Router = require('react-router');
var BModal = require('./base_modal');
var _ = require('lodash');
var serialize = require('form-serialize');
var $ = require('jquery');

var FeedbackModal = React.createClass({
  displayName: 'FeedbackModal',

  propTypes: {
    revealed: React.PropTypes.bool
  },

  mixins: [ Router.State ],

  onSubmit: function (e) {
    e.preventDefault();
    var form = this.refs.feedbackForm.getDOMNode();
    var serial = serialize(form, {hash: true});
    var ok = true;
    var errors = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };

    if (!serial.name || _.trim(serial.name) === '') {
      ok = false;
      errors.name = 'Please provide a valid name.';
    }
    if (serial.email && serial.email.indexOf('@') === -1) {
      ok = false;
      errors.email = 'Please provide a valid email.';
    }

    if (!serial.subject || serial.subject === '--') {
      ok = false;
      errors.subject = 'Please select a subject.';
    }

    if (!serial.message || _.trim(serial.message) === '') {
      ok = false;
      errors.message = 'Please provide some feedback.';
    }

    this.setState({errors});

    if (ok) {
      serial.path = this.getPath();
      console.log('serial', serial);
      this.setState({lockSubmit: true});

      $.post('https://docs.google.com/forms/d/1lvrw3XoTwpoq-TF2MS08XFpKfuhFPoJ7JlQwwN0FzUg/formResponse', {
        'entry.1082145865': serial.name,
        'entry.2088839398': serial.email,
        'entry.104772646': serial.subject,
        'entry.224206870': serial.message,
        'entry.576719779': serial.path
      })
        .always(() => {
          form.reset();
          this.setState({lockSubmit: false});
          this.refs.base.closeModal();
        });
    }
  },

  getInitialState: function () {
    return {
      errors: {
        name: '',
        email: '',
        subject: '',
        message: ''
      },
      lockSubmit: false
    };
  },

  getHeader: function () {
    return (
      <div>
        <h1 className='modal-title'>Feedback</h1>
        <p>We want to know what you think.</p>
      </div>
    );
  },

  getBody: function () {
    return (
      <div>
        <form className='form-horizontal' ref='feedbackForm'>
          <div className='form-group'>
            <label htmlFor='name' className='form-label'>Name</label>
            <div className='form-control-set'>
              <input id='name' name='name' className='form-control input-m input' type='text' placeholder='Bruce Wayne'/>
              {this.state.errors.name ? <p className='message message-alert'>{this.state.errors.name}</p> : null}
            </div>
          </div>
          <div className='form-group'>
            <label htmlFor='email' className='form-label'>Email</label>
            <div className='form-control-set'>
              <input id='email' name='email' className='form-control input-m input' type='email' placeholder='bruce@wayne.co'/>
              <p className='form-help'>Email is optional, but provide one if you want followup.</p>
              {this.state.errors.email ? <p className='message message-alert'>{this.state.errors.email}</p> : null}
            </div>
          </div>
          <div className='form-group'>
            <label htmlFor='email' className='form-label'>Subject</label>
            <div className='form-control-set'>
              <select name='subject' id='subject' className='form-control'>
                <option value='--'>Subject</option>
                <option value='report'>Report a technical issue</option>
                <option value='opinion'>Let us know what you think</option>
                <option value='contact'>Get in touch with OAM team</option>
                <option value='other'>Everything else</option>
              </select>
              {this.state.errors.subject ? <p className='message message-alert'>{this.state.errors.subject}</p> : null}
            </div>
          </div>
          <div className='form-group'>
            <label htmlFor='message' className='form-label'>Feedback</label>
            <div className='form-control-set'>
              <textarea name='message' id='message' rows='5' className='form-control'></textarea>
              {this.state.errors.message ? <p className='message message-alert'>{this.state.errors.message}</p> : null}
            </div>
          </div>
          <div className='form-note'>
            <p>When submitting the form, your current url and other necessary information will be collected.</p>
          </div>
          <div className='form-actions'>
            <button className={'bttn-submit' + (this.state.lockSubmit ? ' disabled' : '')} type='submit' onClick={this.onSubmit}><span>Submit</span></button>
          </div>
        </form>
      </div>
    );
  },

  getFooter: function () {
    return false;
  },

  render: function () {
    return (
      <BModal
        ref='base'
        type='feedback'
        header={this.getHeader()}
        body={this.getBody()}
        footer={this.getFooter()}
        revealed={this.props.revealed} />
    );
  }
});

module.exports = FeedbackModal;
