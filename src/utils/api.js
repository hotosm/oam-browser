/**
 * Central wrapper for making all API requests
 **/

import fetchProgressStore from "stores/fetch_progress_store";

import config from "config";

// The 'response' step of fetch() is just about checking the response,
// not about dealing with the data.
function handleResponse(response) {
  fetchProgressStore.fetchStop();
  if (response.status >= 200 && response.status < 300) {
    if (response.status === 204) return null;
    return response.json();
  }
  let err = new Error(response.statusText);
  err.response = response;
  throw err;
}

// Convert our options to fetch()'s options
function convertToFetchOptions(options) {
  let fetchOptions = {
    method: options.method || "get",
    headers: {
      "content-type": "application/json",
      accept: "application/json"
    }
  };

  // For POST requests, etc
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  // Include cookies, and do so across domains
  if (options.auth === true) {
    fetchOptions.credentials = "include";
  }

  return fetchOptions;
}

// The actual exposed interface to be used in the rest of our app
function api(options) {
  fetchProgressStore.fetchStart();
  const uri = `${config.catalog.url}${options.uri}`;
  const fetchOptions = convertToFetchOptions(options);
  // Returns a promise with the actual response's data as JSON
  return fetch(uri, fetchOptions).then(handleResponse);
}

export default api;
