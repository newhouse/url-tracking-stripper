function getOptionsFromStorage(cb, options) {
  options = options ||
    {
      [STORAGE_KEY_STRIPPING_METHOD_TO_USE]:  DEFAULT_STRIPPING_METHOD
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

    // Get the key/value pairs from the query string
    const keyVals = queryString.split('&');
    // Figure out how many pairs we have
    const kvsLength = keyVals.length;
    // For each iteration fo the loop
    let kv;

    for(let i=0; i < kvsLength; i++) {
      // Get this key/value pair and split it up into its pieces
      kv = keyVals[i].split('=');
      // We are looking for "url=blahblahblah", so see if this is the one
      if (kv[0] === targetParam) {
        return kv[1];
      }
    }
  }
}