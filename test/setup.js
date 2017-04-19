require('babel-register')({
  // Don't ignore transpilation of files from node_modules/
  ignore: false,
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

