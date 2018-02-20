/* global
  chrome
  STORAGE_KEY_STRIPPING_METHOD_TO_USE
  DEFAULT_STRIPPING_METHOD
*/

// eslint-disable-next-line no-unused-vars
function getOptionsFromStorage(cb, options) {
  options = options ||
    {
      [STORAGE_KEY_STRIPPING_METHOD_TO_USE]:  DEFAULT_STRIPPING_METHOD
    };

  return chrome.storage.sync.get(options, cb);
}

// eslint-disable-next-line no-unused-vars
function wildcardMatch(text, pattern) {
  pattern = pattern
    .replace(/\*/g, '([^*]+)')
  ;
  let re = new RegExp(pattern, 'g');
  return re.test(text);
}

// eslint-disable-next-line no-unused-vars
function findQueryParam(targetParam, url) {
  url = new URL(url || window.location.href);
  return url.searchParams.get(targetParam);
}