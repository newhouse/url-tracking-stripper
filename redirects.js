const BUTT_UP_PREVENTER = '<BUTT_UP_PREVENTER>';

const KNOWN_REDIRECTS = [
  {
    name: 'Google Search Results',
    patterns: [
      '*://*.google.com/url?*url=*'
    ],
    targetParam: 'url'
  },
  {
    name: 'RedirectingAt',
    patterns: [
      '*://*.redirectingat.com/?*url=*',
    ],
    targetParam: 'url'
  },
  {
    name: 'Amazon Affiliate',
    patterns: [
      '*://*.amazon.ca/gp/redirect.html?*location=*'
    ],
    targetParam: 'location'
  },
  {
    name: 'Rakuten Marketing',
    patterns: [
      // '*://click.linksynergy.com/deeplink?murl=*',
      '*://click.linksynergy.com/deeplink?*murl=*'
    ],
    targetParam: 'murl'
  },
  {
    name: 'ValueClick',
    patterns: [
      // '*://www.dpbolvw.net/*?url=*',
      '*://www.dpbolvw.net/*?*url=*',

      // '*://www.tkqlhce.com/*?url=*',
      '*://www.tkqlhce.com/*?*url=*'
    ],
    targetParam: 'url'
  },
  {
    name: 'Broadcast',
    patterns: [
      '*://*.broadcast.local/*?*foo=*'
    ],
    targetParam: 'foo'
  }
];

const REDIRECT_PATTERNS_BY_TARGET_PARAM = {};

// Flip everything around a bit and store patterns that are looking for
// the same target all together. This way we can register these patterns
// using a closure-like approach to prevent having to scan the URL again
// to figure out which pattern it matched, and then finally extract the
// target for that pattern. Should result in things being much faster in
// then end.
KNOWN_REDIRECTS.forEach(KNOWN_REDIRECT => {

  // Pluck out the param and the patterns
  const targetParam = KNOWN_REDIRECT.targetParam;
  const patterns    = KNOWN_REDIRECT.patterns

  // Make sure everything looks good
  if (!(targetParam && patterns && patterns.length)) {
    return;
  }

  // Prep the Array if necessary
  if (!(REDIRECT_PATTERNS_BY_TARGET_PARAM[targetParam])) {
    REDIRECT_PATTERNS_BY_TARGET_PARAM[targetParam] = [];
  }

  // Add these patterns to the array of patterns for this target param
  REDIRECT_PATTERNS_BY_TARGET_PARAM[targetParam].push(...patterns);
});