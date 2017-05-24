/* global OAM_UP gapi google */
'use strict';
import config from '../config';

OAM_UP.gPickerApiLoaded = false;
OAM_UP.gAuthApiLoaded = false;
OAM_UP.gAuthToken = false;
OAM_UP.developerKey = config.googleDeveloperKey;

// The google api loads the different components needed one at a time.
// This function is loaded once the core api code loads.
const onGApiLoad = function () {
  gapi.load('auth', {
    'callback': () => {
      OAM_UP.gAuthApiLoaded = true;
    }
  });
  gapi.load('picker', {
    'callback': () => {
      OAM_UP.gPickerApiLoaded = true;
    }
  });
};

const getAuthToken = function () {
  let p = new Promise((resolve, reject) => {
    if (OAM_UP.gAuthToken) {
      return resolve();
    }
    if (OAM_UP.gAuthApiLoaded) {
      gapi.auth.authorize({
        'client_id': config.googleClient,
        'scope': 'https://www.googleapis.com/auth/drive.readonly',
        'immediate': false
      },
      (authResult) => {
        if (authResult && !authResult.error) {
          OAM_UP.gAuthToken = authResult.access_token;
          return resolve();
        } else {
          return reject(`gapi.auth.authorize error: ${authResult.error}`);
        }
      });
    } else {
      return reject('auth api not loaded');
    }
  });
  return p;
};

const pickFiles = function () {
  let p = new Promise((resolve, reject) => {
    if (!OAM_UP.gPickerApiLoaded) {
      return reject('gpicker api not loaded');
    }
    if (!OAM_UP.gAuthToken) {
      return reject('auth token not available');
    }
    new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .addView(google.picker.ViewId.DOCS)
      .setOAuthToken(OAM_UP.gAuthToken)
      .setDeveloperKey(OAM_UP.developerKey)
      .setCallback((data) => {
        console.log('data', data);
        if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
          let res = data[google.picker.Response.DOCUMENTS].map(o => {
            return {
              name: o.name,
              shared: o.isShared,
              // dlUrl: o.isShared ? `https://drive.google.com/uc?export=download&id=${o.id}` : null
              dlUrl: o.isShared ? `gdrive://${o.id}` : null
            };
          });
          return resolve(res);
        } else if (data[google.picker.Response.ACTION] === google.picker.Action.CANCEL) {
          return reject('google picker canceled');
        }
      })
      .build()
      .setVisible(true);
  });
  return p;
};

window.onGApiLoad = onGApiLoad;

module.exports.picker = function () {
  return getAuthToken().then(pickFiles);
};
