'use strict';

const {
  STORAGE_KEY_STRIPPING_METHOD_TO_USE,
  CONTEXT_MENU_COPY_CLEAN_ID,
  CONTEXT_MENU_CLEAN_AND_GO_ID,
  DEFAULT_STRIPPING_METHOD
}                                       = require('./consts');


function getOptionsFromStorage(cb, options) {
  options = options || {
    [STORAGE_KEY_STRIPPING_METHOD_TO_USE]: DEFAULT_STRIPPING_METHOD,
    [CONTEXT_MENU_COPY_CLEAN_ID]: true,
    [CONTEXT_MENU_CLEAN_AND_GO_ID]: true
  };

  return chrome.storage.sync.get(options, cb);
}


function findQueryParam(targetParam, url) {
  url = url || window.location.href;

  if (!(targetParam && url)) {
    return false;
  }

  // Find the first occurrance of '?' character. I've seen URLs that have embedded
  // URLs that are not properly encoded, e.g.:
  // https://www.google.com/url?hl=en&q=http://t.dd.delta.org/r/?id%3Dxxxxx,yyyyyy,zzzzz&source=gmail&ust=1516647918588000&usg=AFQjCNEV1C1cwHSrU8r1kyYmaPe4IAsb-Q
  const queryIndex = url.indexOf('?');

  if (queryIndex === -1) {
    return false;
  }

  // Split the URL at the '?' to get the query string
  const queryString = url.substr(queryIndex + 1);

  // If we have a query string...
  if (queryString) {

    // If the target param was the whole query string, then just return it
    if (targetParam == '*') {
      return queryString;
    }

    // Get the key/value pairs from the query string
    const keyVals = queryString.split('&');
    // Figure out how many pairs we have
    const kvsLength = keyVals.length;
    // For each iteration fo the loop
    let kv;

    for (let i = 0; i < kvsLength; i++) {

      // Get this key/value pair and split it up into its pieces
      kv = keyVals[i].split('=');
      // We are looking for "url=blahblahblah", so see if this is the one
      if (kv[0] === targetParam) {

        // Find last occurrance of '=' character before the targetParam. Some URLs do not have proper
        // encoding of this character. The full URL after the first targetParam is discovered will be used.
        // http://clickserve.dartsearch.net/link/click?lid=000000&ds_dest_url=http://clickserve.dartsearch.net/link/click?lid=000000&ds_dest_url=https://www.bestbuy.com/site/nintendo-switch-32gb-console-neon-red-neon-blue-joy-con

        // if i = 0, then '?' is the target, otherwise search for '&'
        let queryValueIndex = -1;
        if (i = 0) { 
          queryValueIndex = url.indexOf('?' + targetParam) + 1;
        } else {
          queryValueIndex = url.indexOf('&' + targetParam) + 1;
        }

        // Split the URL at the targetParam
        const targetUrl = url.substr(queryValueIndex + kv[0].length + 1);

        return targetUrl;
      }
    }
  }
}


module.exports = {
  getOptionsFromStorage,
  findQueryParam
};
