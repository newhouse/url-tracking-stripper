'use strict';

const KNOWN_REDIRECTS = [
  {
    name: 'Google Search Results',
    targetParam: 'url',
    patterns: [
      '*://www.google.com/url?'
    ],
    // Google uses "ping" method sometimes.
    types: ["main_frame", "ping"]
  },
  {
    // Gmail wraps links in e-mails to pass you through their servers
    name: 'Gmail Link Wrappers',
    targetParam: 'q',
    patterns: [
      '*://www.google.com/url?'
    ],
    // I think that for Gmail, "main_frame" is enough.
    types: ["main_frame"]
  },
  {
    name: 'RedirectingAt',
    targetParam: 'url',
    patterns: [
      '*://*.redirectingat.com/?',
    ],
    types: ["main_frame"]
  },
  {
    name: 'Facebook',
    targetParam: 'u',
    patterns: [
        '*://l.facebook.com/l.php?',
        '*://l.messenger.com/l.php?'
    ],
    types: ["main_frame"]
  },
  {
    name: 'Amazon Affiliate',
    targetParam: 'location',
    patterns: [
      '*://*.amazon.ca/gp/redirect.html?'
    ],
    types: ["main_frame"]
  },
  {
    name: 'Rakuten Marketing',
    targetParam: 'murl',
    patterns: [
      '*://click.linksynergy.com/deeplink?'
    ],
    types: ["main_frame"]
  },
  {
    name: 'ValueClick',
    targetParam: 'url',
    patterns: [
      '*://www.dpbolvw.net/*?',
      '*://www.tkqlhce.com/*?'
    ],
    types: ["main_frame"]
  }
];



// Flip everything around a bit and store patterns that are looking for
// the same target all together. This way we can register these patterns
// using a closure-like approach to prevent having to scan the URL again
// to figure out which pattern it matched, and then finally extract the
// target for that pattern. Should result in things being much faster in
// then end.
// Use 'var' here so that it's not scoped incorrectly.
var REDIRECT_DATA_BY_TARGET_PARAM = {};

KNOWN_REDIRECTS.forEach(KNOWN_REDIRECT => {

  // Pluck out the param and the patterns
  const targetParam       = KNOWN_REDIRECT.targetParam;
  const orginalPatterns   = KNOWN_REDIRECT.patterns;
  const types             = KNOWN_REDIRECT.types;

  // Make sure everything looks good
  if (!(targetParam && orginalPatterns && orginalPatterns.length && types && types.length)) {
    return;
  }

  // Prep the Object if necessary
  if (!(REDIRECT_DATA_BY_TARGET_PARAM[targetParam])) {
    REDIRECT_DATA_BY_TARGET_PARAM[targetParam] = {
      patterns: [],
      types: []
    };
  }

  // Go through every "type" for this redirect
  types.forEach(type => {
    // If we don't already have this type for this target param, add it in
    if(!REDIRECT_DATA_BY_TARGET_PARAM[targetParam].types.includes(type)) {
      REDIRECT_DATA_BY_TARGET_PARAM[targetParam].types.push(type);
    }
  });

  const newPatterns = [];

  // Go through each of these patterns and create any combinations we need to
  orginalPatterns.forEach(originalPattern => {
    const targetParamKv = `${targetParam}=*`;

    // We need to generate a few variations on this original pattern
    // 1) support the URL param as the first param
    newPatterns.push(`${originalPattern}${targetParamKv}`);
    // 2) suppor the URL param as a non-first param
    newPatterns.push(`${originalPattern}*&${targetParamKv}`);
  });

  // Add these patterns to the array of patterns for this target param
  REDIRECT_DATA_BY_TARGET_PARAM[targetParam].patterns.push(...newPatterns);
});