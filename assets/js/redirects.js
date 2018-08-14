'use strict';

const {
  findQueryParam
}                               = require('./common');

const SCHEMA              = '<SCHEMA>';
const SUBDOMAIN           = '<SUBDOMAIN>';
const PATH                = '<PATH>';
const QS_VALUE            = '<QSVALUE>';
const QS_KVS              = '<QSKVS>';
const TARGET_PARAM_IS_QS  = '<TARGET_IS_QS>';


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
    name: 'Google Ad Services',
    targetParam: 'adurl',
    patterns: [
      `${SCHEMA}www.googleadservices.com${PATH}?`
    ],
    types: ['main_frame']
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
    name: 'Rakuten Marketing',
    targetParam: 'RD_PARM1',
    patterns: [
      `${SCHEMA}click.linksynergy.com/fs-bin/click?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Rakuten Marketing 2',
    targetParam: 'murl',
    patterns: [
      `${SCHEMA}click.linksynergy.com/deeplink?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Rakuten Marketing Walmart',
    targetParam: 'RD_PARM1',
    patterns: [
      // BUG: Does not work
      // ${SCHEMA}linksynergy.${SUBDOMAIN}.com${PATH}?
      `${SCHEMA}linksynergy.walmart.com/fs-bin/click?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Rakuten Marketing Walmart 2',
    targetParam: 'murl',
    patterns: [
      `${SCHEMA}linksynergy.walmart.com/deeplink?`
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
    name: 'ValueClick 2',
    targetParam: 'URL',
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
    // bizrate
    name: 'Connexity',
    targetParam: 't',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.bizrate.com${PATH}?`,
      `${SCHEMA}rd.connexity.net/rd?`,
      `${SCHEMA}rd.shop.pricegrabber.com/rd2?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Commission Factory',
    targetParam: 'Url',
    patterns: [
      `${SCHEMA}t.cfjump.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Instapage',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}app.instapage.com/route${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Doubleclick',
    targetParam: TARGET_PARAM_IS_QS,
    patterns: [
      `${SCHEMA}ad.doubleclick.net${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'TrafficRouter',
    targetParam: 'original',
    patterns: [
      `${SCHEMA}go.trafficrouter.io/?`
    ],
    types: ['main_frame']
  },
  {
    name: 'evyy',
    targetParam: 'u',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.evyy.net${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Rover - Internal Site',
    targetParam: 'mpre',
    patterns: [
      `${SCHEMA}rover.ebay.com${PATH}?`
    ],
    types: ['main_frame', 'ping']
  },
  {
    name: 'Rover - External Site',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}rover.ebay.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'PepperJamNetwork',
    targetParam: 'tarurl',
    patterns: [
      `${SCHEMA}www.pepperjamnetwork.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Amazon',
    targetParam: 'location',
    patterns: [
      `${SCHEMA}www.amazon.com/gp/redirect.html?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Amazon CA',
    targetParam: 'location',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.amazon.ca/gp/redirect.html?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Mediaplex',
    targetParam: 'MPRE',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.mediaplex.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Skimresources',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}go.skimresources.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Walmart',
    targetParam: 'l',
    patterns: [
      `${SCHEMA}c.affil.walmart.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Target',
    targetParam: 'u',
    patterns: [
      `${SCHEMA}goto.target.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Target 2',
    targetParam: 'URL',
    patterns: [
      `${SCHEMA}goto.target.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'SJV',
    targetParam: 'u',
    patterns: [
      // TODO: bug
      // http://eddie-bauer-us.sjv.io/c/10451/390289/5671?subid1=9920284a9f8611e8be4baeb9af6f605e0INT&u=http%3A%2F%2Fwww.eddiebauer.com%2Fbrowse%2Fclearance%2F_%2FN-y%3FisClearCat%3Dtrue%26tab%3Dclearance%26cm_sp%3Dtopnav-_-Clearance-_-main%26previousPage%3DGNAV&level=4&tpsync=yes&tpsync=yes&tpsync=yes&tpsync=yes&dst=&brid=&dstsig=&dst=&brid=&dstsig=&dst=&brid=&dstsig=&dst=&brid=&dstsig=&dst=&brid=&dstsig=
      `${SCHEMA}${SUBDOMAIN}.sjv.io${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'SJV 2',
    targetParam: 'URL',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.sjv.io${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Jdoqocy',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}www.jdoqocy.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Linkshare',
    targetParam: 'url',
    patterns: [
      // This pattern works, but does not remove trackers at end
      `${SCHEMA}${SUBDOMAIN}.com/Linkshare?`
    ],
    types: ['main_frame']
  },
  {
    name: 'YouTube',
    targetParam: 'q',
    patterns: [
      `${SCHEMA}www.youtube.com/redirect?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Yelp',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}www.yelp.com/biz_redir?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Share A Sale',
    targetParam: 'urllink',
    patterns: [
      // not working for some reason
      `${SCHEMA}www.shareasale.com/r.cfm?`
    ],
    types: ['main_frame']
  },
  {
    name: 'awin1',
    targetParam: 'p',
    patterns: [
      `${SCHEMA}www.awin1.com/cread.php?`
    ],
    types: ['main_frame']
  },
  {
    name: 'kqzyfj',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}www.kqzyfj.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'kqzyfj 2',
    targetParam: 'URL',
    patterns: [
      `${SCHEMA}www.kqzyfj.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'vudu',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}www.vudu.com/linkShare?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Slickdeals',
    targetParam: 'u2',
    patterns: [
      `${SCHEMA}clicks.slickdeals.net${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'sylikes',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.sylikes.com/?`
    ],
    types: ['main_frame']
  },
  {
    name: 'pxf.io',
    targetParam: 'u',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.pxf.io${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'pvxt',
    targetParam: 'u',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.pvxt.net${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: '7eer',
    targetParam: 'u',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.7eer.net${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'avantlink',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}www.avantlink.com/click.php?`
    ],
    types: ['main_frame']
  },
  {
    name: 'flexlinkspro',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}track.flexlinkspro.com/a.ashx?`
    ],
    types: ['main_frame']
  },
  {
    name: 'shopspring',
    targetParam: 'u',
    patterns: [
      `${SCHEMA}goto.shopspring.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Groupon',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}tracking.groupon.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'zdbb',
    targetParam: TARGET_PARAM_IS_QS,
    patterns: [
      `${SCHEMA}zdbb.net${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'zdcommerce',
    targetParam: 'destination',
    patterns: [
      `${SCHEMA}pixel.zdcommerce.io${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'PepperJam',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}www.pjatr.com${PATH}?`,
      `${SCHEMA}www.pjtra.com${PATH}?`,
      `${SCHEMA}www.pntrac.com${PATH}?`,
      `${SCHEMA}www.pntra.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'DealNews',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}c1.dealnews.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Princess',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}princess.com/linkshare.do?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Dartsearch',
    targetParam: 'ds_dest_url',
    patterns: [
      `${SCHEMA}clickserve.dartsearch.net${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Mercent',
    targetParam: 'mr:targetUrl',
    patterns: [
      `${SCHEMA}link.mercent.com/redirect.ashx?`
    ],
    types: ['main_frame']
  },
  {
    name: 'EverestTech',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}pixel.everesttech.net${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'AdLucent',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}tracking.deepsearch.adlucent.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'krxd',
    targetParam: 'clk',
    patterns: [
      `${SCHEMA}apiservices.krxd.net/click_tracker/track?`
    ],
    types: ['main_frame']
  },
  {
    name: 'xg4ken',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}6005.xg4ken.com/trk/v1?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Voltage Search',
    targetParam: 'durl',
    patterns: [
      `${SCHEMA}tracking.voltagesearch.com/?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Prosperent',
    targetParam: 'location',
    patterns: [
      `${SCHEMA}prosperent.com/api/linkaffiliator/redirect?`
    ],
    types: ['main_frame']
  }
];

// TODO: BUG - shareasale, linksynergy.walmart.com do not work
// http://www.shareasale.com/r.cfm?u=101512&b=450685&m=45519&afftrack=6d08263e9d1c11e8b8aa8e7a0d52cbc40INT&urllink=www.reebok.com%2Fus%2Fmen-daily_deal%3FSSAID%3D101512%26cm_mmc%3DRbkaffiliates_SAS-_-101512-_-None-_-banner-_-dv%3AeCom-_-cn%3A450685-_-pc%3ANone%26cm_mmc1%3DUS%26cm_mmc2%3Dreebok-NA-eCom-Affiliates-101512-None-None-US-450685-None%26dclid%3DCN7ttJq34dwCFRq_TwodW2EODw

// TODO: cj.dotomi, emjcd, cannot parse from URL
// TODO: Prioritize over other extensions, cannot bypass blocked url
// TODO: Make sure tracking QS are removed in final domain after multiple redirects

// Flip everything around a bit and store patterns that are looking for
// the same target all together. This way we can register these patterns
// using a closure-like approach to prevent having to scan the URL again
// to figure out which pattern it matched, and then finally extract the
// target for that pattern. Should result in things being much faster in
// the end.
// Use 'var' here so that it's not scoped incorrectly.
var REDIRECT_DATA_BY_TARGET_PARAM = {};

KNOWN_REDIRECTS.forEach(KNOWN_REDIRECT => {

  // Pluck out the param and the patterns
  const originalTargetParam   = KNOWN_REDIRECT.targetParam;
  const targetParam           = originalTargetParam === TARGET_PARAM_IS_QS ? '*' : originalTargetParam;
  const orginalPatterns       = KNOWN_REDIRECT.patterns;
  const types                 = KNOWN_REDIRECT.types;

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

    // If it's the entire query string...
    if (originalTargetParam === TARGET_PARAM_IS_QS) {
      newPatterns.push(replacePlaceholders(`${originalPattern}${QS_VALUE}`));
      // The regex only needs 1 variation which includes optional query string key/values
      const regexPattern = replacePlaceholdersRegex(`${originalPattern}${QS_VALUE}`);
      newClipboardRegexes.push(new RegExp(regexPattern));
    }
    else {

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
    }
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
    .replace(PATH, '(\\/[\\w;\\-]+)+')
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
  TARGET_PARAM_IS_QS,
  KNOWN_REDIRECTS,
  REDIRECT_DATA_BY_TARGET_PARAM,
  escapeRegExp,
  replacePlaceholdersCreateExample,
  extractRedirectTarget,
  followRedirect
};
