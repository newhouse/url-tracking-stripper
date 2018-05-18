'use strict';

const {URL} = require('url');

'utm_source, *@*.google.com';

function parseRules(rules) {

  rules = rules.split(',');

  for (let rule of rules) {
    rule = rule.trim();

    let split = rule.split('@');

    const tracker = split[0];
    const domain = split[1];

    if (!(tracker || domain)) {
      throw new Error('must have a tracker or a domain');
    }

    if (tracker == '*') {
      if (!domain) {
        throw new Error('must have a domain for a whitelist');
      }

      let startWith, endsWith, contains, equals;
      if (domain.startWith('*.')) {
        endsWith = true;
      }
      if (domain.endsWith('.*')) {
        if (endsWith) {
          startsWith = false;
          endsWith = false;
          contains = true;
        }
        else {

        }
      }
    }
  }
}



const TRACKERS = [];

class DomainMatcher {
  constructor(hostname, options) {

    this.hostname = hostname;

    ['startWith', 'endsWith', 'contains', 'equals'].forEach(type => {
      this[type] = options[type] === true;
    });

    if (this.contains) {
      this.containsPattern = new RegExp("^([\\w\\-]*\\.)*" + hostname.replace('.', '\.') + "(\\.[\\w\\-]+)*$");
    }
  }

  matches(hostname) {
    // console.log('testing', hostname);
    if (this.startWith && hostname.startsWith(this.hostname)) {
      return true;
    }
    if (this.equals || this.endsWith) {
      if (this.hostname == hostname) return true;
      if (hostname.endsWith('.' + this.hostname)) return true;
    }
    if (this.contains) {
      console.log('does it contain?');
      // if (hostname.test(this.containsPattern)) return true;
      if (this.containsPattern.test(hostname)) return true;
    }
    return false;
  }
}

const whiteListedDomainsByRoot = {
  'google.com': new DomainMatcher('google.com', {startWith: true, endsWith: true, contains: true, equals: true})
};

const blackListedDomainsByTracker = {
  'utm_source': [
    new DomainMatcher('google.com', {startWith: true, endsWith: true, contains: true, equals: true})
  ]
};


// Go through all the trackers by their root and turn them into a big regex...
const TRACKER_REGEXES_BY_ROOT = {};
for (let root in TRACKERS_BY_ROOT) {
  // Old way, matching at the end 1 or unlimited times.
  // TRACKER_REGEXES_BY_ROOT[root] = new RegExp("((^|&)" + root + "(" + TRACKERS_BY_ROOT[root].join('|') + ")=[^&#]+)", "ig");
  // New way, matching at the end 0 or unlimited times. Hope this doesn't come back to be a problem.
  TRACKER_REGEXES_BY_ROOT[root] = new RegExp("((^|&)" + root + "(" + TRACKERS_BY_ROOT[root].join('|') + ")=[^&#]*)", "ig");

  TRACKERS_BY_ROOT[root].forEach(suffix => {
    TRACKERS.push(root + suffix);
  });
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
function removeTrackersFromUrl(urlString) {

  const url = new URL(urlString);

  const {
    search: searchString = '',
    searchParams
  } = url;



  // If no params, nothing to modify
  if (searchString === '') {
    return urlString;
  }

  const hostname = cleanHostname(url.hostname);

  const isWhite = isWhitelistedDomain(hostname);

  console.log({
    searchString,
    searchParams,
    hostname,
    isWhite
  });

  if (isWhite) {
    return urlString;
  }

  // return urlString;

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

// Clean up the hostname
function cleanHostname(hostname) {
  if (hostname.startsWith('www.')) {
    return hostname.replace('www.', '');
  }
  return hostname;
}

function isWhitelistedDomain(host) {
  for (let root in whiteListedDomainsByRoot) {
    if(whiteListedDomainsByRoot[root].matches(host)) return true;
  }

  return false;
}

const urls = [
  'https://www.foo.com/path/to/nowhere.html?foo=bar&bar=baz',
  'https://www.google.com/blah?foo=bar',
  'https://mail.google.com/blah?foo=bar',
  'https://mail.notgoogle.com/blah?foo=bar'
];

urls.forEach(url => {
  console.log({url});
  console.log(removeTrackersFromUrl(url));
});

// const regeExDomainChars = '[\\w\\-]';






// const d = new DomainMatcher('google.com', {startWith: true, endsWith: true, contains: true, equals: true});

// console.log({d});

// ['google.com', 'mail.google.com', 'google.com.uk', 'mail.google.com.uk', 'mail.google.com..'].forEach(host => {
//   console.log(host, d.matches(host));
// });

