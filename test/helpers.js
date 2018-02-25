'use strict';

const {
  REDIRECT_DATA_BY_TARGET_PARAM
} = require('../assets/js/redirects');

const {
  escapeRegExp
} = require('../assets/js/redirects');


const {
  findQueryParam
} = require('../assets/js/common');


function escapePattern(pattern) {
  return pattern.replace(/[\?]/g, "\\$&");
}

function patternToRegExp(pattern) {

  pattern = escapePattern(pattern);
  console.log(pattern);


  if (pattern == "<all_urls>") return /^(?:http|https|file|ftp):\/\/.*/;

  var split = /^(\*|http|https|file|ftp):\/\/(.*)$/.exec(pattern);
  if(!split) throw Error("Invalid schema in " + pattern);
  var schema = split[1];
  var fullpath = split[2];

  split = /^([^\/]*)\/(.*)$/.exec(fullpath);
  if(!split) throw Error("No path specified in " + pattern);
  var host = split[1];
  var path = split[2];

  // File
  if(schema == "file" && host != "")
    throw Error("Non-empty host for file schema in " + pattern);

  if(schema != "file" && host == "")
    throw Error("No host specified in " + pattern);

  if(!(/^(\*|\*\.[^*]+|[^*]*)$/.exec(host)))
    throw Error("Illegal wildcard in host in " + pattern);

  var reString = "^";
  reString += (schema == "*") ? "https*" : schema;
  reString += ":\\/\\/";
  // Not overly concerned with intricacies
  //   of domain name restrictions and IDN
  //   as we're not testing domain validity
  reString += host.replace(/\*\.?/, "[^\\/]*");
  // reString += "(:\\d+)?";
  reString += "\\/";
  reString += path.replace("*", ".*");
  reString += "$";

  return RegExp(reString);
}


// should put this somewhere common
function extractRedirectTarget(url, targetParam = 'url') {
  // See if we can find a target in the URL.
  let target = findQueryParam(targetParam, url);

  if (typeof target === 'string' && target.startsWith('http')) {
    target = decodeURIComponent(target);
  }
  else {
    target = false;
  }

  return target;
}


function findRedirect(url) {
  outerLoop:
  // Go through each target param
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
  patternToRegExp,
  extractRedirectTarget,
  findRedirect
};