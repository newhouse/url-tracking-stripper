'use strict';


// More detailed string pattern suffixes, stored by their common root.
const TRACKERS_BY_ROOT = {

  // Google's Urchin Tracking Module
  'utm_': [
    'campaign',
    'channel',
    'cid',
    'content',
    'expid',
    'medium',
    'name',
    'pubreferrer',
    'reader',
    'referrer',
    'source',
    'swu',
    'term',
    'viz_id'
  ],

  // Adobe Coldfusion
  '': [
    'CFID',
    'CFTOKEN'
  ],

  // Adobe Omniture SiteCatalyst
  'IC': [
    'ID'
  ],

  // Adobe Omniture SiteCatalyst
  'ic': [
    'id'
  ],

  // comScore Digital Analytix
  'ns_': [
    'campaign',
    'mchannel',
    'source',
    'linkname',
    'fee'
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

  // Oracle Eloqua
  'elq': [
    'TrackID',
    'aid',
    'at',
    'CampaignId',
    ''
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

  // Web Trends
  'WT.': [
    'mc_id',
    'srch',
    'ac',
    'qs_osrc',
    'pn_sku'
  ],

  // AppNexus: Impression Tracker Service
  '': [
    'advertiser_id',
    'ancost',
    'cachebuster'
  ],

  // matomo Tracking HTTP API
  '': [
    '_cvar',
    '_id',
    '_idts',
    '_idvc',
    '_rck',
    '_rcn',
    '_viewts',
    'action_name',
    'apiv',
    'c_i',
    'c_n',
    'c_p',
    'c_t',
    'cid',
    'e_a',
    'e_c',
    'e_n',
    'e_v',
    'idsite',
    'ma_fs',
    'ma_h',
    'ma_id',
    'ma_le',
    'ma_mt',
    'ma_pn',
    'ma_ps',
    'ma_re',
    'ma_st',
    'ma_ti',
    'ma_ttp',
    'ma_w',
    'rand',
    'rec',
    'res',
    'uid',
    'urlref'
  ],

  // ListHub Query String API
  '': [
    'clid',
    'eo',
    'et',
    'ev',
    'lkey',
    'mp',
    'pr',
    'ua',
    'up',
    'v'
    // 'ip'
  ],

  // unsure
  'c3': [
    'ch',
    'nid'
  ],

  // unsure
  'cm_': [
    'mmc',
    're',
    'sp'
  ],

  // unsure
  'cvo': [
    'src',
    '_campaign'
  ],

  // unsure
  'mi_': [
    'u',
    'xml_params',
    'url',
    'eaddr'
  ],

  // unsure
  'sp_': [
    'source',
    'campaign'
  ],

  // unsure
  'ran': [
    'MID',
    'EAID',
    'SiteID'
  ],

  // id
  '': [
    'AFFID',
    '_cmp',
    '_ebid',
    '_mid',
    'acampID',
    'affID',
    'afid',
    'aid',
    'clickid',
    'clkid',
    'dclid',
    'ehid',
    'eid',
    'et_rid',
    'flyer_run_id',
    'jid',
    'lkid',
    'mid',
    'mktID',
    'nid',
    'oid',
    'sdtid', // slickdeals
    'sid',
    'siteid',
    'smid',
    'source_id',
    'sourceid',
    'src_bizid',
    'tmcampid',
    'trkid'
  ],

  // Non-prefixy and 1-offs
  '': [
    // Google Click Identifier
    'gclid',
    'gclsrc',
    // Unknown
    'ncid',
    // Unknown
    'nr_email_referer',
    // Generic-ish. Facebook, Product Hunt and others
    'ref',
    // Alibaba-family 'super position model' tracker:
    // https://github.com/newhouse/url-tracking-stripper/issues/38
    'spm',
    // Slickdeals Related
    'a',
    'avad',
    'nm_mc',
    'loc',
    'tag',
    'ascsubtag',
    'referrer',
    'srcref',
    // iTunes
    'pt',
    'ct',
    'at',
    // Fanatical
    'aff_track',
    'afftrack',
    'CJEVENT',
    // Walmart
    'u1',
    'wmlspartner',
    'affillinktype',
    'veh',
    // Groupon
    'lnm',
    'tsToken',
    'campaign',
    'CMP',
    'linkCode',
    'linkId',
    'camp',
    // Linkshare
    'LinkshareID',
    'PartnerID',
    'banner_type',
    // Coupon Cabin
    'irgwc',
    // Amazon
    'm',
    's',
    'th',
    // Dotomi
    'CJPIXEL',
    // Misc
    'AFS',
    'cj_pub_sid',
    'clickref',
    'psc', // amazon
    // yelp
    'website_link_type'
  ]
};

// TODO: Some sites, level QS must = 0 otherwise cookie error
// TODO: Site specific QS removal

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
