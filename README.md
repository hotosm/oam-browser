# OAM Browser

[![Build Status](https://travis-ci.org/hotosm/oam-browser.svg?branch=master)](https://travis-ci.org/hotosm/oam-browser)

The OAM-Browser is a part of the [OpenAerialMap](https://github.com/hotosm/OpenAerialMap) project. See the [OpenAerialMap](https://github.com/hotosm/OpenAerialMap) repository for more information about the project and contribute to the development. 

Submit any issues and feedback regarding the imagery browser in the [issue tracker](https://github.com/hotosm/oam-browser/issues). 

Access the site at http://beta.openaerialmap.org. 

## Development environment
To set up the development environment for this website, you'll need to install the following on your system:

- Node (v4.2.x) & Npm ([nvm](https://github.com/creationix/nvm) usage is advised)

> The versions mentioned are the ones used during development. It could work with newer ones.
  Run `nvm use` to activate the correct version.

After these basic requirements are met, run the following commands in the website's folder:
```
$ npm install
```

### Getting started

Source code goes in `app` and after building it will be copied to `dist`.

```
$ npm run serve
```
Compiles the sass files, javascripts, and launches the server making the site available at `http://localhost:3000/`
The system will watch files and execute tasks whenever one of them changes.
The site will automatically refresh since it is bundled with livereload.

### Other commands
```
$ npm run build
```
Builds the app for production, and puts it into `/dist`.

```
$ npm run lint
```
Lints the app according with the defined style.

## Configuration
The configuration options are defined in `app/assets/scripts/config.js`.
If you're using a custom [oam-catalog](https://github.com/hotosm/oam-catalog/) or a different map account, you need to update the respective values:

```js
module.exports = {
  map: {
    mapbox : {
      accessToken: '<mapbox access token>'
    },
    // ...
  },
  catalog: {
    url: '<catalog url (no trailing slash)>'
  }
};
```