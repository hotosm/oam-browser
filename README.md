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

Access the site at http://openaerialmap.org. 

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
  - `staging.js` will be loaded whenever the env variable `NODE_ENV` is set to staging.
  - `local.js` will be loaded if it exists.

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

# Production deployment
To prepare the app for deployment run:

```
npm run build
```
This will package the app and place all the contents in the `dist` directory.
The app can then be run by any web server.

## Testing
2 distinct test suites exist.

**Unit-like tests**, under `test/specs`    
These should be isolated and fast, with as much mocking/stubbing as possible, suitable for TDD. Run with:    
`mocha --opts test/specs/mocha.opts test/specs` or `npm test`

**Integration tests**, under `test/integration`    
These are end-to-end, cross-browser tests, that should test as much of the stack as possible. Currently they are run on Browser Stack against various browsers. They can be run locally against a Web Driver compatible browser client like (chromedriver)[https://sites.google.com/a/chromium.org/chromedriver/] or (geckodriver)[https://github.com/mozilla/geckodriver]. To run locally, use:    
`wdio test/integration/wdio.local.conf.js`.

Because `wdio` wraps `mocha`, you can send `mocha` args via `wdio.default.conf.js`'s `mochaOpts` field. For instance `grep` has been added so you can isolate a single test run with:    
`MOCHA_MATCH='should find imagery' wdio test/integration/wdio.local.conf.js`

## License
OAM Browser is licensed under **BSD 3-Clause License**, see the [LICENSE](LICENSE) file for more details.
