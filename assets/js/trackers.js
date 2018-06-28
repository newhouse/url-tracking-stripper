'use strict';


// More detailed string pattern suffixes, stored by their common root.
const TRACKERS_BY_ROOT = {

  // Google's Urchin Tracking Module
  'utm_': [
    'source',
    'medium',
    'term',
    'campaign',
    'content',
    'name',
    'cid',
    'reader',
    'viz_id',
    'pubreferrer',
    'swu'
  ],

  // Adobe Omniture SiteCatalyst
  'IC': [
    'ID'
  ],

  // Adobe Omniture SiteCatalyst
  'ic': [
    'id'
  ],

  // Hubspot
  '_hs': [
    'enc',
    'mi'
  ],

  // Marketo
  'mkt_': [
    'tok'
  ],

  // MailChimp
  // https://developer.mailchimp.com/documentation/mailchimp/guides/getting-started-with-ecommerce/
  'mc_': [
    'cid',
    'eid'
  ],

  // Simple Reach
  'sr_': [
    'share'
  ],

  // Vero
  'vero_': [
    'conv',
    'id'
  ],

  // Non-prefixy and 1-offs
  '': [
    // Google Click Identifier
    'gclid',
    // Unknown
    'ncid',
    // Unknown
    'nr_email_referer',
    // Generic-ish. Facebook, Product Hunt and others
    'ref',
    // Alibaba-family 'super position model' tracker:
    // https://github.com/newhouse/url-tracking-stripper/issues/38
    'spm'
  ]
};



// Go through all the trackers by their root and turn them into a big regex...
const TRACKER_REGEXES_BY_ROOT = {};
for (let root in TRACKERS_BY_ROOT) {
  // Old way, matching at the end 1 or unlimited times.
  // TRACKER_REGEXES_BY_ROOT[root] = new RegExp("((^|&)" + root + "(" + TRACKERS_BY_ROOT[root].join('|') + ")=[^&#]+)", "ig");
  // New way, matching at the end 0 or unlimited times. Hope this doesn't come back to be a problem.
  TRACKER_REGEXES_BY_ROOT[root] = new RegExp("((^|&)" + root + "(" + TRACKERS_BY_ROOT[root].join('|') + ")=[^&#]*)", "ig");
}


// Generate the URL patterns used for webRequest filtering
// https://developer.chrome.com/extensions/match_patterns
function generateTrackerPatternsArray() {
  const array = [];
  for (let root in TRACKERS_BY_ROOT) {
    for (let i=0; i < TRACKERS_BY_ROOT[root].length; i++) {
      array.push( "*://*/*?*" + root + TRACKERS_BY_ROOT[root][i] + "=*" );
    }
  }

  return array;
}


// Actually strip out the tracking codes/parameters from a URL and return the cleansed URL
function removeTrackersFromUrl(url) {
  if (!url) return url;

  const urlPieces = url.split('?');

  // If no params, nothing to modify
  if (urlPieces.length === 1) {
    return url;
  }

  // Go through all the pattern roots
  for (let root in TRACKER_REGEXES_BY_ROOT) {
    // If we see the root in the params part, then we should probably try to do some replacements
    if (urlPieces[1].indexOf(root) !== -1) {
      urlPieces[1] = urlPieces[1].replace(TRACKER_REGEXES_BY_ROOT[root], '');
    }
  }

  // If we've collapsed the URL to the point where there's an '&' against the '?'
  // then we need to get rid of that.
  while (urlPieces[1].charAt(0) === '&') {
    urlPieces[1] = urlPieces[1].substr(1);
  }

  return urlPieces[1] ? urlPieces.join('?') : urlPieces[0];
}


module.exports = {
  TRACKERS_BY_ROOT,
  TRACKER_REGEXES_BY_ROOT,
  generateTrackerPatternsArray,
  removeTrackersFromUrl
};