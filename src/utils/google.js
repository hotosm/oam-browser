/* global OAM_UP gapi google */
import config from "config";

OAM_UP.gPickerApiLoaded = false;
OAM_UP.gAuthApiLoaded = false;
OAM_UP.gAuthToken = null;
OAM_UP.developerKey = config.googleDeveloperKey;

// The google api loads the different components needed one at a time.
// This function is loaded once the core api code loads.
const gApiBoot = function () {
  gapi.load("auth", {
    callback: () => {
      OAM_UP.gAuthApiLoaded = true;

      OAM_UP.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: config.googleClient,
        scope: "https://www.googleapis.com/auth/drive",
        callback: "", // defined later
      });
    },
  });
  gapi.load("picker", {
    callback: async () => {
      OAM_UP.gPickerApiLoaded = true;
    },
  });
};

const getAuthToken = function () {
  return new Promise((resolve, reject) => {
    if (OAM_UP.gAuthToken) {
      return resolve();
    }

    OAM_UP.tokenClient.callback = async (response) => {
      if (response.error !== undefined) {
        reject(response.error);
      } else {
        OAM_UP.gAuthToken = response.access_token;
        resolve();
      }
    };

    if (OAM_UP.gAuthToken === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      OAM_UP.tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      OAM_UP.tokenClient.requestAccessToken({ prompt: "" });
    }
  });
};

const pickFiles = function () {
  return new Promise((resolve, reject) => {
    const view = new google.picker.View(google.picker.ViewId.DOCS);
    view.setMimeTypes('image/tiff');
    const picker = new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .setOAuthToken(OAM_UP.gAuthToken)
      .setAppId(config.googleAppId)
      .setDeveloperKey(OAM_UP.developerKey)
      .addView(view)
      .addView(new google.picker.DocsUploadView())
      .setCallback((data) => {
        console.log("data", data);
        if (
          data[google.picker.Response.ACTION] === google.picker.Action.PICKED
        ) {
          let res = data[google.picker.Response.DOCUMENTS].map((o) => {
            return {
              name: o.name,
              shared: o.isShared,
              // dlUrl: o.isShared ? `https://drive.google.com/uc?export=download&id=${o.id}` : null
              dlUrl: o.isShared ? `gdrive://${o.id}` : null,
            };
          });
          return resolve(res);
        } else if (
          data[google.picker.Response.ACTION] === google.picker.Action.CANCEL
        ) {
          return reject("google picker canceled");
        }
      })
      .build();
    picker.setVisible(true);
  });
};

window.addEventListener("load", gApiBoot, false);

export default {
  picker: function () {
    return getAuthToken().then(pickFiles);
  },
};
