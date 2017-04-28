// Transpile everything to es2015
require('babel-register')({

  // Because oam-design-system is an external dependency under
  // By default babel-register ignores everything under node_modules.
  // This is a problem for us because oam-design-system is there. Thus
  // follows the regex:
  only: /assets\/scripts|oam-design\/assets|test/,

  'presets': [
    'react',
    'stage-0',
    [require('babel-preset-es2015').buildPreset, { loose: true }]
  ]
});

// All tests here should be shallow rendered and not need something
// like jsdom. So keep DOM stubs here to a minimum.
global.window = {
  location: {
    href: ''
  }
};

