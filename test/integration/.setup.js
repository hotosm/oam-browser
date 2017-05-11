// Transpile everything to es2015
require('babel-register')({
  'presets': [
    'stage-0',
    [require('babel-preset-es2015').buildPreset, { loose: true }]
  ]
});
