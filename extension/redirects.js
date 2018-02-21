'use strict';

const SCHEMA = '<SCHEMA>';
const SUBDOMAIN = '<SUBDOMAIN>';
const PATH = '<PATH>';
const QS_VALUE = '<QS_VALUE>';
const QS_KVS = '<QSKVS>';

const KNOWN_REDIRECTS = [
  {
    name: 'Google Search Results',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}www.google.com/url?`
    ],
    // Google uses "ping" method sometimes.
    types: ["main_frame", "ping"]
  },
  {
    // Gmail wraps links in e-mails to pass you through their servers
    name: 'Gmail Link Wrappers',
    targetParam: 'q',
    patterns: [
      `${SCHEMA}www.google.com/url?`
    ],
    // I think that for Gmail, "main_frame" is enough.
    types: ["main_frame"]
  },
  {
    name: 'RedirectingAt',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.redirectingat.com/?`,
    ],
    types: ["main_frame"]
  },
  {
    name: 'Facebook',
    targetParam: 'u',
    patterns: [
      `${SCHEMA}l.facebook.com/l.php?`,
      `${SCHEMA}l.messenger.com/l.php?`
    ],
    types: ["main_frame"]
  },
  {
    name: 'Amazon Affiliate',
    targetParam: 'location',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.amazon.ca/gp/redirect.html?`
    ],
    types: ["main_frame"]
  },
  {
    name: 'Rakuten Marketing',
    targetParam: 'murl',
    patterns: [
      `${SCHEMA}click.linksynergy.com/deeplink?`
    ],
    types: ["main_frame"]
  },
  {
    name: 'ValueClick',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}www.dpbolvw.net${PATH}?`,
      `${SCHEMA}www.tkqlhce.com${PATH}?`
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
      regexes: [],
      types: []
    };
  }

  // Go through every "type" for this redirect
  types.forEach(type => {
    // If we don't already have this type for this target param, add it in
    if (!REDIRECT_DATA_BY_TARGET_PARAM[targetParam].types.includes(type)) {
      REDIRECT_DATA_BY_TARGET_PARAM[targetParam].types.push(type);
    }
  });

  const newPatterns = [];
  const newClipboardRegexes = [];

  // Go through each of these patterns and create any combinations we need to
  orginalPatterns.forEach(originalPattern => {

    // Create the key/value placeholder for the target param
    const targetParamKv = `${targetParam}=${QS_VALUE}`;

    // We need to generate a few variations on this original pattern for URL matching
    // 1) support the URL param as the first param
    newPatterns.push(replacePlaceholders(`${originalPattern}${targetParamKv}`));
    // 2) support the URL param as a non-first param
    newPatterns.push(replacePlaceholders(`${originalPattern}${QS_KVS}${targetParamKv}`));

    // The regex only needs 1 variation which includes optional query string key/values
    const regexPattern = replacePlaceholdersRegex(`${originalPattern}${QS_KVS}${targetParamKv}`);
    newClipboardRegexes.push(new RegExp(regexPattern));
  });

  // Add these patterns to the array of patterns for this target param
  REDIRECT_DATA_BY_TARGET_PARAM[targetParam].patterns.push(...newPatterns);

  // Add these regexes to the array of regexes for this target param
  REDIRECT_DATA_BY_TARGET_PARAM[targetParam].regexes.push(...newClipboardRegexes);
});


// Replace the placeholders for URL matching patterns
function replacePlaceholders(pattern) {
  pattern = pattern.replace(SCHEMA, '*://');
  pattern = pattern.replace(SUBDOMAIN, '*');
  pattern = pattern.replace(PATH, '/*');
  pattern = pattern.replace(QS_KVS, '*&');
  pattern = pattern.replace(QS_VALUE, '*');

  return pattern;
}

// Replace the placeholders for regex matching patterns
function replacePlaceholdersRegex(pattern) {
  // Escape all the literals
  pattern = escapeRegExp(pattern);

  pattern = pattern.replace(SCHEMA, 'http(s)?\:\\/\\/');
  pattern = pattern.replace(SUBDOMAIN, '([a-zA-z\-0-9]*\.)?');
  pattern = pattern.replace(PATH, '(\\/[\\w]+)+');
  pattern = pattern.replace(QS_KVS, '([\\w]+\\=[\\w]+\\&)*');
  pattern = pattern.replace(QS_VALUE, '\\w');

  return pattern;
}

// Escape all of the literals
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}