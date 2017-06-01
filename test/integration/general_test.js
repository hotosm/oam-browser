function waitUntilGone (selector) {
  browser.waitForVisible(selector, 300000, true);
}

function finishLoading () {
  waitUntilGone('.loading.revealed');
}

describe('Basic', () => {
  beforeEach(() => browser.url('/'));

  it('should have the right page title', () => {
    expect(browser.getTitle()).to.eq('OpenAerialMap Browser');
  });

  it('should find imagery over London', () => {
    $('#global-search__input').setValue(['London', 'Enter']);
    waitUntilGone('.autocomplete__menu-item*=Loading...');
    browser.click('.autocomplete__menu-item.is-highlighted');
    finishLoading();
    browser.click('#map');
    finishLoading();
    const results = $$('.pane-body-inner .results-list li');
    expect(results.length).to.be.at.least(8);
  });
});

describe('Selected Layers', () => {
  it('should allow zooming beyond 18 for high res tiles', () => {
    // Known high res imagery in Sanfrancisco
    const sanFran = '#/-122.409,37.735,18/0230102033332/58d7f0e7b0eae7f3b143c108?_k=ju8si1';
    // TODO: Why doesn't deleteCookie() in the mocha's before() work?
    browser.url('/');
    browser.url(sanFran);
    finishLoading();
    expect('.button-zoom--in.disabled');
    // Click the 'TMS' button
    browser.waitForVisible('button=TMS');
    browser.click('button=TMS');
    // TODO: waiting here is necessary because of a blocking sync AJAX hack
    // in map.js getLayerMaxZoom().
    waitUntilGone('.button-zoom--in.disabled');
    const classes = $('.button-zoom--in').getAttribute('class');
    expect(classes).not.to.include('disabled');
  });
});

describe('Upload Form', () => {
  const sampleImagery = 'https://github.com/openimagerynetwork/oin-meta-generator/blob/master/' +
    'test/fixtures/everest-utm.gtiff?raw=true';

  it('should submit imagery', () => {
    browser.url('#/upload');
    $('#uploader-token').setValue('a4c74e86faba225cd2c10b0257ac672e230ae43068440a14a82c31b9426c1ef5');
    $('#uploader-name').setValue('Automated Test Name');
    $('#uploader-email').setValue('automatedtest@example.com');
    $('#scene-0-title').setValue('Automated Test Title');
    $('#scene-0-sensor').setValue('Automated Test Sensor');
    browser.click('button=Url');
    $('#scene-0-img-loc-0-url').setValue(sampleImagery);
    $('#scene-0-provider').setValue('Automated Test Provider');
    browser.click('button=Submit');
    browser.waitForVisible('a=Check upload status.');
    browser.click('a=Check upload status.');
    browser.waitForVisible('h2=Status upload');
    const status = browser.getText('p.status').toLowerCase();
    expect(status).to.eq('pending');
  });
});
