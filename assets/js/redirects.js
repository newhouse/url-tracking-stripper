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

// TODO
const TARGET_PARAM_NO_QS  = '<TARGET_NO_QS>';


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
    name: 'Walmart Email Tracking',
    targetParam: 'extra',
    patterns: [
      `${SCHEMA}tracking01.walmart.com/track?`
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
    name: 'Rover - Internal Site 2',
    targetParam: 'loc',
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
    name: 'Amazon - Email',
    targetParam: 'U',
    patterns: [
      `${SCHEMA}www.amazon.com/gp/r.html?`
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
    name: 'Amazon - Adsystem',
    targetParam: 'rd',
    patterns: [
      `${SCHEMA}s.amazon-adsystem.com${PATH}?`
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
    name: 'Slickdeals - 2',
    targetParam: 'u2',
    patterns: [
      `${SCHEMA}slickdeals.net${PATH}?`
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
  },
  {
    name: 'KevyMail',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.clk.kevymail.com${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Deref-GMX',
    targetParam: 'redirectUrl',
    patterns: [
      `${SCHEMA}deref-gmx.net${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'LinkedIn',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}www.linkedin.com/redir/redirect?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Webgains',
    targetParam: 'wgtarget',
    patterns: [
      `${SCHEMA}track.webgains.com/click.html?`
    ],
    types: ['main_frame']
  },
  {
    name: 'GeoRiot',
    targetParam: 'GR_URL',
    patterns: [
      `${SCHEMA}target.georiot.com/Proxy.ashx?`
    ],
    types: ['main_frame']
  },
  {
    name: 'viglink',
    targetParam: 'u',
    patterns: [
      `${SCHEMA}redirect.viglink.com/?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Vans',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}www.vans.com/webapp/wcs/stores/servlet/LinkShareGateway?`
    ],
    types: ['main_frame']
  },
  {
    name: 'EastBay',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}www.eastbay.com/linkshare.cfm?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Dotomi',
    targetParam: "<TARGET_NO_QS>",
    patterns: [
      `${SCHEMA}cj.dotomi.com${PATH}`
    ],
    types: ['main_frame']
  },
  // REDIRECTS SUCH AS "ARE YOU SURE YOU WANT TO LEAVE OUR SITE?" USE AT OWN RISK
  {
    name: 'Steam',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}steamcommunity.com/linkfilter/?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Disqus',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}disq.us${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Digidip',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.digidip.net${PATH}?`
    ],
    types: ['main_frame']
  },
  {
    name: 'SoundCloud',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}exit.sc/?`
    ],
    types: ['main_frame']
  },
  {
    name: 'DigitalTrends',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}www.digitaltrends.com/go/?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Google Plus',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}plus.url.google.com/url?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Instagram',
    targetParam: 'u',
    patterns: [
      `${SCHEMA}l.instagram.com/?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Slack',
    targetParam: 'url',
    patterns: [
      `${SCHEMA}slack-redir.net/link?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Tumblr',
    targetParam: 'z',
    patterns: [
      `${SCHEMA}t.umblr.com/redirect?`
    ],
    types: ['main_frame']
  },
  {
    name: 'Curse',
    targetParam: 'remoteUrl',
    patterns: [
      `${SCHEMA}${SUBDOMAIN}.curseforge.com/linkout?`
    ],
    types: ['main_frame']
  },
];

// TODO: https://prf.hn/click/camref:000000/destination:https%3A%2F%2Fwww.sprint.com%2Fen%2Fshop%2Foffers%2Ffree-unlimited.html%3FECID%3Dvanity%3A1yearfree
// TODO: http://cj.dotomi.com/links-t/7278242/type/dlg/sid/xxxxx/https://www.bedbathandbeyond.com/store/static/coupons?sid=WW64ea0ffc2343b42ba4f2c5b0

// TODO: BUG: some urls do not have their tracking stripped if a redirect is 
// followed yet is not the final url and is not a handled redirect
// ex. Slickdeals
// fixed with hacky fix

// TODO: Make sure tracking is only stripped if the url is an 
// unhandled redirect. 

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
  const originalPatterns       = KNOWN_REDIRECT.patterns;
  const types                 = KNOWN_REDIRECT.types;

  // Make sure everything looks good
  if (!(targetParam && originalPatterns && originalPatterns.length && types && types.length)) {
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
  originalPatterns.forEach(originalPattern => {

    // If it's the entire query string...
    if (originalTargetParam === TARGET_PARAM_IS_QS) {
      newPatterns.push(replacePlaceholders(`${originalPattern}${QS_VALUE}`));
      // The regex only needs 1 variation which includes optional query string key/values
      const regexPattern = replacePlaceholdersRegex(`${originalPattern}${QS_VALUE}`);
      newClipboardRegexes.push(new RegExp(regexPattern));
    // } else if (originalTargetParam === TARGET_PARAM_NO_QS) {

    //   // TODO: make sure implementation is correct

    //   const targetParamNoKv = ``;

    //   newPatterns.push(replacePlaceholders(`${originalPattern}*\/http`));
    //   // The regex only needs 1 variation which includes optional query string key/values
    //   const regexPattern = replacePlaceholdersRegex(`${originalPattern}*\/http`);
    //   newClipboardRegexes.push(new RegExp(regexPattern));

    } else {

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

  // Some URLs do not start with 'http' in the value of the target parameter
  // ex. www.website.com
  // TODO: Figure out a way to find if a URL is valid

  if (typeof target === 'string') {
    // make sure the url is valid when decoded
    if (target.indexOf('http') !== -1) {
      // check helps urls where the target is preceded by misc. characters
      // http://tracking01.walmart.com/track?type=click&extra=&&&http://www.walmart.com/account/communicationsandprivacy
      if (target.indexOf('https') !== -1) {
        target = target.substr(target.indexOf('https'));
      } else {
        target = target.substr(target.indexOf('http'));
      }
    } else if (!target.startsWith('http')) {
      target = 'http://' + target;
    }
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
  TARGET_PARAM_NO_QS,
  KNOWN_REDIRECTS,
  REDIRECT_DATA_BY_TARGET_PARAM,
  escapeRegExp,
  replacePlaceholdersCreateExample,
  extractRedirectTarget,
  followRedirect
};
