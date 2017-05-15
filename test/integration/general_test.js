function finishLoading () {
  browser.waitForVisible('.loading.revealed', 300000, true);
}

describe('Basic', () => {
  beforeEach(() => browser.url('/'));

  it('should have the right page title', () => {
    expect(browser.getTitle()).to.eq('OpenAerialMap Browser');
  });

  it('should find imagery over London', () => {
    $('#global-search__input').setValue(['London', 'Enter']);
    finishLoading();
    browser.click('#map');
    finishLoading();
    // IE11 seems to have a serious JS perf problem, so finishLoading() can't
    // be relied upon.
    browser.waitForVisible('.pane-body-inner .results-list li', 300000);
    const results = $$('.pane-body-inner .results-list li');
    expect(results.length).to.be.at.least(8);
  });
});

describe('Selected Layers', () => {
  it.only('should allow zooming beyond 18 for high res tiles', () => {
    // Known high res imagery in Sanfrancisco
    const sanFran = '#/-122.409,37.735,18/0230102033332/58d7f0e7b0eae7f3b143c108';
    browser.url(sanFran);
    finishLoading();
    expect('.button-zoom--in.disabled');
    // Click the 'TMS' button
    browser.click('.preview-options__buttons:nth-child(2)');
    const classes = $('.button-zoom--in').getAttribute('class');
    expect(classes).not.to.include('disabled');
  });
});
