'use strict';

const {
  ALL_TRACKERS
} = require("./trackers");

class DomainMatcher {
  constructor(hostname, options) {
    this.hostname = hostname;
    ['startWith', 'endsWith', 'contains', 'equals'].forEach(type => {
      this[type] = options[type] === true;
    });
  }

  generateHostPatterns() {
    if (this.patterns) {
      return this.patterns;
    }

    const {
      hostname,
    } = this;

    const patterns = [];
    // Let's test this out...
    if (this.contains) {
      patterns.push(`*://*.${hostname}.*/*`);
    }
    else {
      if (this.startWith) {
        // patterns.push(`*://${hostname}*/*`);
      }
      if (this.endsWith) {
        patterns.push(`*://*.${hostname}/*`);
      }
      if (this.equals) {
        patterns.push(`*://${hostname}/*`);
      }
    }

    return this.patterns = patterns;
  }
}

class DomainRule {
  constructor(opts) {
    this.domainMatcher = opts.domainMatcher;

    this.whitelist = opts.whitelist || [];
    this.blacklist = opts.blacklist || [];

    this.getApplicableTrackers();
    this.generateUrlPatterns();
  }

  getDomainMatcher() {
    return this.domainMatcher;
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

  generateHostPatterns() {
    return this.domainMatcher.generateHostPatterns();
  }

  generateUrlPatterns() {
    if (this.urlPatterns) {
      return this.urlPatterns;
    }

    const applicableTrackers = this.getApplicableTrackers();

    return this.urlPatterns = this.domainMatcher.generateHostPatterns().reduce((urlPatterns, hostPattern) => {
      applicableTrackers.forEach(tracker => {
        urlPatterns.push(`${hostPattern}?*${tracker}=*`);
      });

      return urlPatterns;
    }, []);
  }
}

// Order of these is significant
const DEFAULT_DOMAIN_RULES = [
  new DomainRule({
    domainMatcher: new DomainMatcher('gitlab.com', {
      endsWith: true,
    }),
    blacklist: ['ref'],
    whitelist: ALL_TRACKERS,
  }),
  new DomainRule({
    domainMatcher: new DomainMatcher('steampowered.com', {
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

module.exports = {
  DOMAIN_RULES: COMBINED_DOMAIN_RULES,
};
