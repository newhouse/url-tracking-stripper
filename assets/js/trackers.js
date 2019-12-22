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

  // comScore Digital Analytix?
  // http://www.about-digitalanalytics.com/comscore-digital-analytix-url-campaign-generator
  'ns_': [
    'source',
    'mchannel',
    'campaign',
    'linkname',
    'fee'
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
    // Facebook Click Identifier
    // http://thisinterestsme.com/facebook-fbclid-parameter/
    'fbclid',
    // Google Click Identifier
    'gclid',
    // Some other Google Click thing
    'ocid',
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

const ALL_TRACKERS = Object.keys(TRACKERS_BY_ROOT).reduce((trackers, root) => {
  TRACKERS_BY_ROOT[root].forEach(suffix => trackers.push(root + suffix));
  return trackers;
}, []);


class DomainMatcher {
  constructor(hostname, options) {

    this.hostname = hostname;

    this.validOptions = ['startWith', 'endsWith', 'contains', 'equals'];

    this.validOptions.forEach(type => {
      this[type] = options[type] === true;
    });
  }

  hostnameMatches(hostname) {
    console.log("hostnameMatches");
    console.log({me: this, hostname});

    if (!(this.hostname && hostname)) {
      return false;
    }

    if (this.contains && hostname.includes(this.hostname)) {
      return true;
    }
    if (this.startWith && hostname.endsWith(this.hostname)) {
      return true;
    }
    if (this.endsWith && hostname.endsWith(this.hostname)) {
      return true;
    }
    if (this.equals && hostname === this.hostname) {
      return true;
    }

    return false;
  }

  generateHostPatterns() {
<<<<<<< HEAD
    if (this.patterns) {
      return this.patterns;
    }

=======
>>>>>>> feels ok
    const {
      hostname,
    } = this;

    const patterns = [];
    if (this.contains) {
<<<<<<< HEAD
      patterns.push(`*://*.${hostname}.*/`);
    }
    else {
      if (this.startWith) {
        // patterns.push(`*://${hostname}*/`);
      }
      if (this.endsWith) {
        patterns.push(`*://*.${hostname}/`);
=======
      patterns.push(`*://*${hostname}*/`);
    }
    else {
      if (this.startWith) {
        patterns.push(`*://${hostname}*/`);
      }
      if (this.endsWith) {
        patterns.push(`*://*${hostname}/`);
>>>>>>> feels ok
      }
      if (this.equals) {
        patterns.push(`*://${hostname}/`);
      }
    }
<<<<<<< HEAD

    return this.patterns = patterns;
=======
>>>>>>> feels ok
  }
}

class DomainRule {
  constructor(opts) {
    this.domainMatcher = opts.domainMatcher;
    this.whitelist = opts.whitelist || [];
    this.blacklist = opts.blacklist || [];
    this.applicableTrackers = null;
    this.urlPatterns = null;
  }

  getDomainMatcher() {
    return this.domainMatcher;
  }

  hostnameMatches(hostname) {
    return this.domainMatcher.hostnameMatches(hostname);
  }

  getApplicableTrackers() {
    if (this.applicableTrackers) {
      return this.applicableTrackers;
    }

    const {
      whitelist,
      blacklist
    } = this;

    return this.applicableTrackers = whitelist.filter(item => !blacklist.includes(item));
  }

  generateUrlPatterns() {
    if (this.urlPatterns) {
      return this.urlPatterns;
    }

    const applicableTrackers = this.getApplicableTrackers();

    return this.urlPatterns = this.domainMatcher.generateHostPatterns().reduce((urlPatterns, hostPattern) => {
      applicableTrackers.forEach(tracker => {
        urlPatterns.push(`${hostPattern}*?*${tracker}=*`);
      });

      return urlPatterns;
    }, []);
  }
}


// man i hope that order is important here or i'm gonna
// need a new idea!
const DEFAULT_DOMAIN_RULES = [
  new DomainRule({
    domainMatcher: new DomainMatcher('gitlab.com', {
      endsWith: true,
    }),
    blacklist: ['ref'],
    whitelist: ALL_TRACKERS,
  }),
  new DomainRule({
    domainMatcher: new DomainMatcher('*', {
      equals: true,
    }),
    blacklist: [],
    whitelist: ALL_TRACKERS,
  }),
];

const COMBINED_DOMAIN_RULES = DEFAULT_DOMAIN_RULES;

// Go through all the trackers by their root and turn them into a big regex...
const TRACKER_REGEXES_BY_ROOT = {};
for (let root in TRACKERS_BY_ROOT) {
  // Old way, matching at the end 1 or unlimited times.
  // TRACKER_REGEXES_BY_ROOT[root] = new RegExp("((^|&)" + root + "(" + TRACKERS_BY_ROOT[root].join('|') + ")=[^&#]+)", "ig");
  // New way, matching at the end 0 or unlimited times. Hope this doesn't come back to be a problem.
  TRACKER_REGEXES_BY_ROOT[root] = new RegExp("((^|&)" + root + "(" + TRACKERS_BY_ROOT[root].join('|') + ")=[^&#]*)", "ig");
}

const TRACKER_REGEXES_BY_TRACKER = ALL_TRACKERS.reduce((memo, tracker) => {
  memo[tracker] = new RegExp("((^|&)" + tracker + "=[^&#]*)", "ig");
<<<<<<< HEAD
  return memo;
=======
>>>>>>> feels ok
}, {});


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
function removeTrackersFromUrl(url, applicableTrackers) {
  if (!url) return url;

  const urlPieces = url.split('?');

  // If no params, nothing to modify
  if (urlPieces.length === 1) {
    return url;
  }

  applicableTrackers.forEach(tracker => {
    urlPieces[1] = urlPieces[1].replace(TRACKER_REGEXES_BY_TRACKER[tracker], '');
  });

  // Go through all the pattern roots
  // for (let root in TRACKER_REGEXES_BY_ROOT) {
  //   // If we see the root in the params part, then we should probably try to do some replacements
  //   if (urlPieces[1].indexOf(root) !== -1) {
  //     urlPieces[1] = urlPieces[1].replace(TRACKER_REGEXES_BY_ROOT[root], '');
  //   }
  // }

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
  removeTrackersFromUrl,
  DOMAIN_RULES: COMBINED_DOMAIN_RULES,
};