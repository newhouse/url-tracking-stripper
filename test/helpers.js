'use strict';

const {
  removeTrackersFromUrl
} = require('../assets/js/trackers');

const {
  KNOWN_REDIRECTS,
  replacePlaceholdersCreateExample,
  findRedirect
} = require('../assets/js/redirects');




function escapePattern(pattern) {
  return pattern.replace(/[\?]/g, "\\$&");
}


// https://stackoverflow.com/questions/26420269/call-googles-match-patterns-api
function patternToRegExp(pattern) {

  pattern = escapePattern(pattern);

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


function skipRedirectAndRemoveTrackers(url) {
  url = findRedirect(url);

  url = removeTrackersFromUrl(url);

  return url;
}


const REDIRECTS_BY_TARGET_PARAM = {};

KNOWN_REDIRECTS.forEach(redirect => {
  const {
    targetParam,
    patterns
  } = redirect;

  if(!REDIRECTS_BY_TARGET_PARAM[targetParam]) {
    REDIRECTS_BY_TARGET_PARAM[targetParam] = [];
  }

  patterns.forEach(pattern => {
    const example = replacePlaceholdersCreateExample(pattern);
    REDIRECTS_BY_TARGET_PARAM[targetParam].push(example);
  });
});


module.exports = {
  patternToRegExp,
  skipRedirectAndRemoveTrackers,
  REDIRECTS_BY_TARGET_PARAM
};

