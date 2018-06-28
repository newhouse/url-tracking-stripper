'use strict';

const {
  findQueryParam
}                               = require('./common');

const SCHEMA          = '<SCHEMA>';
const SUBDOMAIN       = '<SUBDOMAIN>';
const PATH            = '<PATH>';
const QS_VALUE        = '<QSVALUE>';
const QS_KVS          = '<QSKVS>';


const KNOWN_REDIRECTS = [
  {
    name: 'Google Search Results',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}www.google.com/url?`
    ],
    // Google uses 'ping' method sometimes.
    types: ['main_frame', 'ping']
  },
  {
    // Gmail wraps links in e-mails to pass you through their servers
    name: 'Gmail Link Wrappers',
    targetParam: 'q',
    patterns: [
      `${SCHEMA}www.google.com/url?`
    ],
    // I think that for Gmail, 'main_frame' is enough.
    types: ['main_frame']
  },
  {
    name: 'RedirectingAt',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.redirectingat.com/?`,
    ],
    types: ['main_frame']
  },
  {
    name: 'Facebook',
    targetParam: 'u',
    patterns: [
      `${SCHEMA}l.facebook.com/l.php?`,
      `${SCHEMA}l.messenger.com/l.php?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Amazon Affiliate',
    targetParam: 'location',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.amazon.ca/gp/redirect.html?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Rakuten Marketing',
    targetParam: 'murl',
    patterns: [
      `${SCHEMA}click.linksynergy.com/deeplink?`
    ],
    types: ['main_frame']
  },
  {
    name: 'ValueClick',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}www.dpbolvw.net${PATH}?`,
      `${SCHEMA}www.tkqlhce.com${PATH}?`,
      `${SCHEMA}www.anrdoezrs.net${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Reddit',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}out.reddit.com${PATH}?`,
    ],
    types: ['main_frame']
  },
  {
    name: 'Tradedoubler',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.tradedoubler.com/click?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Impact Radius',
    targetParam: 'return',
    patterns: [
      `${SCHEMA}www.ojrq.net/p/?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Connexity',
    targetParam: 't',
    patterns: [
      `${SCHEMA}rd.connexity.net/rd?`
    ],
    types: ['main_frame']
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

  // Go through every 'type' for this redirect
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


// Escape all of the literals
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

// Replace the placeholders for URL matching patterns
function replacePlaceholders(pattern) {
  return pattern
    .replace(SCHEMA, '*://')
    .replace(SUBDOMAIN, '*')
    .replace(PATH, '/*')
    .replace(QS_KVS, '*&')
    .replace(QS_VALUE, '*');
}

// Replace the placeholders for regex matching patterns
function replacePlaceholdersRegex(pattern) {
  // Escape all the literals
  return escapeRegExp(pattern)
    .replace(SCHEMA, 'http(s)?\:\\/\\/')
    .replace(SUBDOMAIN, '([a-zA-z\-0-9]*\.)?')
    .replace(PATH, '(\\/[\\w\\-]+)+')
    // This one required text on either side of the '=' sign, when I've seen
    // some places build junk that would not match. Not sure if this is a good idea
    // to "fix" or not.
    // pattern = pattern.replace(QS_KVS, '([\\w]+\\=[\\w]+\\&)*');
    // This would be the "fix" for the above. It allows blanks on either side of the
    // '=' sign.
    // pattern = pattern.replace(QS_KVS, '([\\w*+\\=[\\w]*\\&)*');
    // OK, this one handles even more scenarios that are acceptable
    .replace(QS_KVS, '([\\w*+\\=?[\\w]*\\&)*')
    .replace(QS_VALUE, '\\w');
}

// Replace the placeholders to create an example URL
function replacePlaceholdersCreateExample(pattern) {
  return pattern
    .replace(SCHEMA, 'https://')
    .replace(SUBDOMAIN, 'foo')
    .replace(PATH, '/path/to/whatever')
    .replace(QS_KVS, '&')
    .replace(QS_VALUE, 'foo');
}


// Extract the redirect target from a URL given the target parameter
function extractRedirectTarget(url, targetParam = 'url') {
  // See if we can find a target in the URL.
  let target = findQueryParam(targetParam, url);

  if (typeof target === 'string' && target.startsWith('http')) {
    return decodeURIComponent(target);
  }

  return false;
}


// Find a known redirect in a url and return it, else return the original URL
function followRedirect(url) {
  if (!url) return url;

  // Go through each target param
  outerLoop:
  for (let targetParam in REDIRECT_DATA_BY_TARGET_PARAM) {
    // Get the regexes for this target param
    const {
      regexes = []
    } = REDIRECT_DATA_BY_TARGET_PARAM[targetParam];

    // Go through each regex for this target param
    for (let regex, i=0; i < regexes.length; i++) {
      regex = regexes[i];
      // If the URL matches this redirect pattern, then extract the redirect.
      if (regex.test(url)) {
        url = extractRedirectTarget(url, targetParam) || url;
        // All done with this regex stuff.
        break outerLoop;
      }
    }
  }

  return url;
}



module.exports = {
  KNOWN_REDIRECTS,
  REDIRECT_DATA_BY_TARGET_PARAM,
  escapeRegExp,
  replacePlaceholdersCreateExample,
  extractRedirectTarget,
  followRedirect
};