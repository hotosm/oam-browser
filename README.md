
<h1 align="center">OAM Imagery Browser</h1>

<a href="https://travis-ci.org/hotosm/oam-browser">
  <img src="https://travis-ci.org/hotosm/oam-browser.svg?branch=master" alt="Build Status"></img>
</a>

![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=cDZRbGdjT2RDWjh1SmlzblV0N2RmQlMxZ0gzVWpRYVZMNDA0QnhMOU9hUT0tLUw1SU5KbTFueXJ3cjhYMktKRFczb0E9PQ==--6eea14e7ccbb21dc29f04d43dbbe2c8111e7a198)


<div align="center">
  <h3>
  <a href="https://docs.openaerialmap.org/ecosystem/getting-started">Ecosystem</a>
  <span> | </span>
  <a href="https://github.com/hotosm/oam-catalog">Catalog API</a>
  <span> | </span>
  <a href="https://github.com/hotosm/openaerialmap.org">OAM Homepage</a>
  </h3>
</div>

The OAM Imagery Browser is a part of the [OpenAerialMap](https://github.com/hotosm/OpenAerialMap) project. It gets data from the [OAM Catalog API](). Read the [ecosystem documentation](https://docs.openaerialmap.org/ecosystem/getting-started) and the [Github OAM docs](https://github.com/hotosm/openaerialmap) for more information about the project and contribute to the development. 

Submit any issues and feedback regarding the imagery browser in the [issue tracker](https://github.com/hotosm/oam-browser/issues). 

Access the site at http://map.openaerialmap.org. 


## Installation and Usage

The steps below will walk you through setting up your own instance of the oam-browser.

### Install Project Dependencies
To set up the development environment for this website, you'll need to install the following on your system:

- [Node](http://nodejs.org/) v4.2 (To manage multiple node versions we recommend [nvm](https://github.com/creationix/nvm))

### Install Application Dependencies

If you use [`nvm`](https://github.com/creationix/nvm), activate the desired Node version:

```
nvm install
```

Install Node modules:

```
npm install
```
### Usage

#### Config files
All the config files can be found in `app/assets/scripts/config`.
After installing the projects there will be 3 main files:
  - `local.js` - Used only for local development. On production this file should not exist or be empty.
  - `staging.js`
  - `production.js`

The `production.js` file serves as base and the other 2 will override it as needed:
  - `staging.js` will be loaded whenever the env variable `DS_ENV` is set to staging.
  - `local.js` will be loaded if it exists.

The following options must be set: (The used file will depend on the context)
  - `map.mapbox.accessToken` - The token for mapbox.
  - `initialZoom` - The initial zoom for the map.
  - `minZoom` - The minimum zoom allowed.
  - `maxZoom` - The maximum zoom allowed.
  - `initialView` - Coordinates for the initial view in format `[lng, lat]`
  - `catalog.url` - The [OAM catalog](https://github.com/hotosm/oam-catalog) url (no trailing slash).
  - `oamStatus` - The oam status healthcheck endpoint

Example:
``` 
module.exports = {
  map: {
    mapbox: {
      accessToken: 'pk.eyJ1IjoiaG90IiwiYSI6ImNpdmlkM2lkMDAwYTAydXBnNXFkd2EwemsifQ.KPrUb_mKlPmHCR6LNrSihQ'
    },

    initialZoom: 8,
    minZoom: 2,
    maxZoom: undefined,

    initialView: [60.177, 25.148]
  },
  catalog: {
    url: 'https://api.openaerialmap.org'
  },
  oamStatus: 'https://status.openaerialmap.org/healthcheck'
};
```

#### Map layers
The layers for the layer switcher can be customized in `app/assets/scripts/utils/map-layers-js`.
Each layer definition must be and object with the following properties:
```
  {
    id: 'unique id',
    name: 'Display name',
    url: 'full tms url'
  }
```
Note: The url **must** be a tms url like: 'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png'

#### Starting the app

```
npm run serve
```
Compiles the sass files, javascript, and launches the server making the site available at `http://localhost:3000/`
The system will watch files and execute tasks whenever one of them changes.
The site will automatically refresh since it is bundled with livereload.

```
npm run lint
```
Lints the app according with the defined style.

# Deployment
To prepare the app for deployment run:

```
npm run build
```
This will package the app and place all the contents in the `dist` directory.
The app can then be run by any web server.

## License
OAM Browser is licensed under **BSD 3-Clause License**, see the [LICENSE](LICENSE) file for more details.
