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
