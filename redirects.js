const MATCHING_ENGINE_REGEX = 'REGEX';
const MATCHING_ENGINE_CHROME = 'CHROME';

const PLACEHOLDER_SCHEME  = '<SCHEME>';
const PLACEHOLDER_SUBDOMAIN = '<SUBDOMAIN>';
const PLACEHOLDER_PATH = '<PATH>';
const PLACEHOLDER_QUERY_PARAMS = '<QUERY_PARAMS>';
const PLACEHOLDER_VALUE = '<VALUE>';

const REPLACEMENTS_BY_PLACEHOLDER = {

  [PLACEHOLDER_SCHEME]: {
    [MATCHING_ENGINE_CHROME]: '*',
    [MATCHING_ENGINE_REGEX]: 'https?:\/\/'
  },

  [PLACEHOLDER_SUBDOMAIN]: {
    [MATCHING_ENGINE_CHROME]: '*.',
    [MATCHING_ENGINE_REGEX]: '(?:\w*\.)?'
  },

  [PLACEHOLDER_PATH]: {
    [MATCHING_ENGINE_CHROME]: '*',
    [MATCHING_ENGINE_REGEX]: '(?:\w|\.|\/|\#)*'
  },

  [PLACEHOLDER_QUERY_PARAMS]: {
    [MATCHING_ENGINE_CHROME]: '?*',
    [MATCHING_ENGINE_REGEX]: ''
  },

  [PLACEHOLDER_VALUE]: {
    [MATCHING_ENGINE_CHROME]: '*',
    [MATCHING_ENGINE_REGEX]: ''
  }
}

const KNOWN_REDIRECTS = [
  {
    name: 'Google Search Results',
    patterns: [
      // `${PLACEHOLDER_SCHEME}://${PLACEHOLDER_SUBDOMAIN}google.com/url?url=*`,
      `${PLACEHOLDER_SCHEME}://${PLACEHOLDER_SUBDOMAIN}google.com/url${PLACEHOLDER_QUERY_PARAMS}url=${PLACEHOLDER_VALUE}`
    ],
    targetParam: 'url'
  },
  {
    name: 'RedirectingAt',
    patterns: [
      // `${PLACEHOLDER_SCHEME}://${PLACEHOLDER_SUBDOMAIN}redirectingat.com/?url=*`,
      `${PLACEHOLDER_SCHEME}://${PLACEHOLDER_SUBDOMAIN}redirectingat.com/${PLACEHOLDER_QUERY_PARAMS}url=${PLACEHOLDER_VALUE}`,
    ],
    targetParam: 'url'
  },
  {
    name: 'Amazon Affiliate',
    patterns: [
      // `${PLACEHOLDER_SCHEME}://${PLACEHOLDER_SUBDOMAIN}amazon.ca/gp/redirect.html?location=*`,
      `${PLACEHOLDER_SCHEME}://${PLACEHOLDER_SUBDOMAIN}amazon.ca/gp/redirect.html${PLACEHOLDER_QUERY_PARAMS}location=${PLACEHOLDER_VALUE}`
    ],
    targetParam: 'location'
  },
  {
    name: 'Rakuten Marketing',
    patterns: [
      // `${PLACEHOLDER_SCHEME}://click.linksynergy.com/deeplink?murl=*`,
      `${PLACEHOLDER_SCHEME}://click.linksynergy.com/deeplink${PLACEHOLDER_QUERY_PARAMS}murl=${PLACEHOLDER_VALUE}`
    ],
    targetParam: 'murl'
  },
  {
    name: 'ValueClick',
    patterns: [
      // `${PLACEHOLDER_SCHEME}://www.dpbolvw.net/*?url=*`,
      `${PLACEHOLDER_SCHEME}://www.dpbolvw.net/${PLACEHOLDER_PATH}${PLACEHOLDER_QUERY_PARAMS}url=${PLACEHOLDER_VALUE}`,

      // `${PLACEHOLDER_SCHEME}://www.tkqlhce.com/*?url=*`,
      `${PLACEHOLDER_SCHEME}://www.tkqlhce.com/${PLACEHOLDER_PATH}${PLACEHOLDER_QUERY_PARAMS}url=${PLACEHOLDER_VALUE}`
    ],
    targetParam: 'url'
  }
];

function replacePatternFor(pattern = '', fo = MATCHING_ENGINE_CHROME) {
  if (!pattern) {
    return stringy;
  }

  for (const fromString in REPLACEMENTS_BY_PLACEHOLDER) {
    const toStringg = REPLACEMENTS_BY_PLACEHOLDER[fromString][MATCHING_ENGINE_CHROME];
    pattern = pattern.replace(new RegExp(fromString, 'g'), toStringg);
  }

  return pattern;
}

const matchPatternsByTargetParam = {};

KNOWN_REDIRECTS.forEach(KNOWN_REDIRECT => {
  const targetParam = KNOWN_REDIRECT.targetParam;
  const patterns = KNOWN_REDIRECT.patterns
  // Make sure we have the target param and there are some patterns
  if (!(targetParam && patterns && patterns.length)) {
    return;
  }

  // Make sure there is an Array waiting for us there
  if(!(matchPatternsByTargetParam[targetParam])) {
    matchPatternsByTargetParam[targetParam] = [];
  }

  KNOWN_REDIRECT.patterns.forEach(pattern => {
    pattern = replacePatternFor(pattern);
    matchPatternsByTargetParam[targetParam].push(pattern);
  });
});