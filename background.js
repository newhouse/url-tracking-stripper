// Helper function to log things
function log() {
  console.log(...arguments);
}

// SHOULD WE SKIP GOOGLE SEARCH RESULTS PAGE REDIRECTS AND GO RIGHT TO THE TARGET?
let SKIP_KNOWN_REDIRECTS    = true;
// What method are we using?  Defaults to history change
let STRIPPING_METHOD_TO_USE = STRIPPING_METHOD_HISTORY_CHANGE;

// Store some things in various ways for centralized definitiion of what's available.
// Must use 'var' here because it's accessed in the options.js via chrome.runtime.getBackgroundPage
var STUFF_BY_STRIPPING_METHOD_ID = {
  [STRIPPING_METHOD_HISTORY_CHANGE.toString()]: {
    html: "History Change (cosmetic only)",
    add: function() {
      // Monitor tab updates so that we may update the history/url to not contain tracking params
      chrome.tabs.onUpdated.addListener(historyChangeHandler);
    },
    remove: function() {
      chrome.tabs.onUpdated.removeListener(historyChangeHandler);
    }
  },
  [STRIPPING_METHOD_CANCEL_AND_RELOAD.toString()]: {
    html: "Cancel and Re-load (some increased privacy)",
    add: function() {
      // Monitor tab updates so that we may cancel and re-load them without tracking params
      chrome.tabs.onUpdated.addListener(cancelAndReloadHandler);
      // Monitor for subsequent Navigations so that we may indicate if a change
      // was made or not.
      chrome.webNavigation.onCompleted.addListener(webNavigationMonitor);
    },
    remove: function() {
      chrome.tabs.onUpdated.removeListener(cancelAndReloadHandler);
      chrome.webNavigation.onCompleted.removeListener(webNavigationMonitor);
    }
  },
  [STRIPPING_METHOD_BLOCK_AND_RELOAD.toString()]: {
    html: "Block and Re-load (most privacy)",
    add: function() {

      registerRedirectHandlers(false);

      // We are only concerned with URLs that appear to have tracking parameters in them
      // and are in the main frame
      const filters = {
        urls:   generatePatternsArray(),
        types:  ["main_frame"]
      };
      const extra = ["blocking"];
      // Monitor WebRequests so that we may block and re-load them without tracking params
      chrome.webRequest.onBeforeRequest.addListener(blockAndReloadHandler, filters, extra);
      // Monitor for subsequent Navigations so that we may indicate if a change
      // was made or not.
      chrome.webNavigation.onCompleted.addListener(webNavigationMonitor);

    },
    remove: function() {
      unRegisterRedirectHandlers();
      chrome.webRequest.onBeforeRequest.removeListener(blockAndReloadHandler);
      chrome.webNavigation.onCompleted.removeListener(webNavigationMonitor);
    }
  }
};

function foo(details) {
  console.log(1);
  return {};
}

// Go through all the trackers by their root and turn them into a big regex...
const regexesByRoot = {};
for (let root in trackersByRoot) {
  regexesByRoot[root] = new RegExp("((^|&)" + root + "(" + trackersByRoot[root].join('|') + ")=[^&#]+)", "ig");
}


const REDIRECT_HANDLERS = [];


function unRegisterRedirectHandlers() {
  let handler;
  while(handler = REDIRECT_HANDLERS.pop()) {
    console.log('removing handler...');
    chrome.webRequest.onBeforeRequest.removeListener(handler);
  }
}


function registerRedirectHandlers(blocking = false) {
  unRegisterRedirectHandlers();

  blocking = blocking === true;

  for (let targetParam in matchPatternsByTargetParam) {
    const urls = matchPatternsByTargetParam[targetParam];

    console.log('urls in for', targetParam, urls);

    let filters = {
      urls:   urls,
      types:  ["main_frame"]
    };

    const extra = [];

    if (blocking) {
      extra.push("blocking");
    }

    const fn = details => {
      console.log(`pattern matched for "${targetParam}" on ${details.url}`);
      console.log('urls:', urls);
      console.log('deets', details);

      const targetUrl = extractRedirectTarget(details.url, targetParam);
      console.log('targetUrl:', targetUrl);

      if (targetUrl) {
        if (blocking) {
          console.log('redirecting...');

          return {
            redirectUrl: targetUrl
          };
        }
        else {
          setTimeout(() => {
          console.log("tab updating...");
          // let tabId = details.tabId;
          chrome.tabs.update(details.tabId, {url: targetUrl});
          // changeManager.storeChanges(details.tabId, details.url, targetUrl);
          }, 10000);
        }
      }

      return {};
    }

    console.log('Adding handler for', targetParam);

    REDIRECT_HANDLERS.push(fn);
    chrome.webRequest.onBeforeRequest.addListener(fn, filters, extra);
  }
}

// Generate the URL patterns used for webRequest filtering
// https://developer.chrome.com/extensions/match_patterns
function generatePatternsArray() {
  const array = [];
  for (let root in trackersByRoot) {
    for (let i=0; i < trackersByRoot[root].length; i++) {
      array.push( "*://*/*?*" + root + trackersByRoot[root][i] + "=*" );
    }
  }
  // // If we are supposed to skip known redirects...
  // if (SKIP_KNOWN_REDIRECTS) {
  //   // For each redirect service
  //   KNOWN_REDIRECTS.forEach(KNOWN_REDIRECT => {
  //     // If there is a populated patterns array, add its elements to the array we are building
  //     if (KNOWN_REDIRECT.patterns && KNOWN_REDIRECT.patterns.length) {
  //       array.push(...KNOWN_REDIRECT.patterns);
  //     }
  //   })

  //   console.log('KNOWN_REDIRECTS are in the array:', array);
  // }

  return array;
}

// Actually strip out the tracking codes/parameters from a URL and return the cleansed URL
function removeTrackersFromUrl(url) {
  const urlPieces = url.split('?');

  // If no params, nothing to modify
  if (urlPieces.length === 1) {
    return url;
  }

  // Go through all the pattern roots
  for (let root in regexesByRoot) {
    // If we see the root in the params part, then we should probably try to do some replacements
    if (urlPieces[1].indexOf(root) !== -1) {
      urlPieces[1] = urlPieces[1].replace(regexesByRoot[root], '');
    }
  }

  // If we've collapsed the URL to the point where there's an '&' against the '?'
  // then we need to get rid of that.
  while (urlPieces[1].charAt(0) === '&') {
    urlPieces[1] = urlPieces[1].substr(1);
  }

  return urlPieces[1] ? urlPieces.join('?') : urlPieces[0];
}

// Let's check a URL to see if there's anything to strip from it. Will return
// false if there was nothing to strip out
function checkUrlForTrackers(originalUrl) {

  // If the URL is "excepted", that means we should not try to strip any junk
  // from it, so we're done here.
  if (exceptionsManager.isExceptedUrl(originalUrl)) {
    return false;
  }

  // The URL to cleanse starts out as the original URL
  let urlToCleanse  = originalUrl;
  // The cleansed URL starts out as false
  let cleansedUrl   = false;

  // Let's see if a Google Search Results target can/should be extracted
  const redirectTargetUrl = extractRedirectTarget(urlToCleanse);

  // If there was a Google Search target URL, then let's swap out
  // both the urlToCleanse and the cleansedUrl with that
  if (redirectTargetUrl) {
    urlToCleanse  = redirectTargetUrl;
    cleansedUrl  = redirectTargetUrl;
  }

  // See if there is anything to strip from the URL to cleanse, else use whatever
  // we already have stored in 'cleansedUrl'
  cleansedUrl = removeTrackersFromUrl(urlToCleanse) || cleansedUrl;

  // If it looks like we altered the URL, return a cleansed URL, otherwise false
  return (originalUrl != cleansedUrl) ? cleansedUrl : false;

}

// Let's see if this URL is a Google Search Results Page URL, and if so try to
// extract the target URL from it.
function extractRedirectTarget(url, targetParam = 'url') {
  // If skipping of Google Redirects is not enabled OR the URL doesn't look right
  // just return false and be done.
  if (false && !(SKIP_KNOWN_REDIRECTS)) {
    return false;
  }

  let param = false;
  const redirectsLength = KNOWN_REDIRECTS.length;

  // for (let i=0; i < redirectsLength; i++) {
  //   const redirect = KNOWN_REDIRECTS[i];
  //   const patterns = redirect.patterns || [];
  //   const patternsLength = patterns.length;

  //   for (let j=0; j < patternsLength; j++) {
  //     if ()
  //   }
  //   patterns.forEach
  // }
  // && url.startsWith('https://www.google.com/url?'))) {
  //   return false;
  // }

  // See if we can find a target in the URL.
  let target = findQueryParam(targetParam, url);

  if (typeof target === 'string') {
    target = decodeURIComponent(target);
  }
  else {
    target = false;
  }

  return target;
}


// Handler for doing History Change approach
function historyChangeHandler(tabId, changeInfo, tab) {
  // If the change was not to the URL, we're done.
  if (!changeInfo.url) {
    return;
  }

  // Returns false if we didn't replace antyhing
  const cleansedUrl = checkUrlForTrackers(tab.url);

  if (cleansedUrl) {
    // Execute script in that tab to update the History
    chrome.tabs.executeScript(tabId, {
      code: "history.pushState(history.state, document.title, '" + cleansedUrl + "');"
    });

    // Save the fact that we stripped something for indication later on.
    changeManager.storeChanges(tab.id, tab.url, cleansedUrl);
    // And then immediately indicate this fact since WebNavigation has already
    // taken place since there's no other possible hook.
    changeManager.indicateChange(tab.id, cleansedUrl);
  }
}

// Handler for doing Cancel and Re-load approach
function cancelAndReloadHandler(tabId, changeInfo, tab) {
  // If the change was not to the URL, we're done.
  if (!changeInfo.url) {
    return;
  }

  // Returns false if we didn't replace anything, but let's use what
  // we had for cleansedUrl in that case as it could have
  const cleansedUrl = checkUrlForTrackers(tab.url);

  if (cleansedUrl) {
    // Update the URL for that tab.
    chrome.tabs.update(tabId, {url: cleansedUrl});
    // Save the fact that we stripped something for indication later on.
    // Actually pass the original URL here so that it can be show in the
    // indication on the Page Action
    changeManager.storeChanges(tab.id, tab.url, cleansedUrl);
  }
}

// Handler for doing Block Web-request and Re-load approach
function blockAndReloadHandler(details) {

  console.log('FOOOOOO');

  if (!details.url) {
    return {};
  }

  // Returns false if we didn't replace anything, but let's use what
  // we had for cleansedUrl in that case as it could have
  const cleansedUrl = checkUrlForTrackers(details.url);

  if (cleansedUrl) {
    // Save the fact that we stripped something for indication later on.
    changeManager.storeChanges(details.tabId, details.url, cleansedUrl);
    // Redirect the browser to the cleansed URL and be done here
    return { redirectUrl: cleansedUrl };
  }
  // Return an empty object, which indicates we're not blocking/redirecting this
  // request
  return {};
}

// We may need to monitor navigation so that we can let the user know when we've
// stripped something from a URL
const webNavigationMonitor = function(details) {
  //  We only care about "main_frame"
  if (details.frameId !== 0) {
    return;
  }

  // Let's make sure this tab exists. Have seen some issues with Chrome pre-rendering
  // but not firing the tabs.onReplaced event, so just have to be a little
  // cautious.
  chrome.tabs.get(details.tabId, function(tab) {
    // Problems are caught by the runtim.lastError mechanism
    if (chrome.runtime.lastError) {
      changeManager.clearTab(details.tabId);
      return;
    }
    // OK, let's see if we likely stripped something from the URL of this page
    changeManager.indicateChange(details.tabId, details.url);
  });
};


// Let's manage any exceptions that the User has indicated they would like
const exceptionsManager = {
  url_exceptions: [],

  addUrlException: function(url) {
    exceptionsManager.url_exceptions.push(url);
  },

  isExceptedUrl: function(url) {
    // Will check to see if a URL is "excepted" from being stripped. If it is
    // then it's removed from the list of exceptions as it's 1-time only, and
    // true is returned. Otherwise false is returned.

    // If there are no exceptions (most likely) or this URL is not among them
    // then return false
    if (exceptionsManager.url_exceptions.length === 0) {
      return false;
    }

    const index = exceptionsManager.url_exceptions.indexOf(url);

    if (index === -1) {
      return false;
    }
    else {
      // We have an exeption here!
      exceptionsManager.url_exceptions.splice(index,1);
      return true;
    }
  }
}

const changeManager = {
  // We'll store URL change information by tab id
  changesByTabId: {},

  // Clear URL change information for a given tab
  clearTab: function(tabId) {
    delete changeManager.changesByTabId[tabId];
  },

  // Check to see if it looks like we changed the URL for a tab, and update/display
  // the pageAction if so
  indicateChange: function(tabId, cleansedUrl) {
    // If we have change data for a tab and the URLs appear to match, let's update the pageAction
    if (changeManager.changesByTabId[tabId] && changeManager.changesByTabId[tabId].cleansedUrl === cleansedUrl) {
      chrome.pageAction.show(tabId);
      chrome.pageAction.setTitle({
        'tabId': tabId,
        'title': "URL changed from " + changeManager.changesByTabId[tabId].originalUrl
      });
      // We can pass params into the URL like any other webpage, which is useful for dynamically generating the content:
      chrome.pageAction.setPopup({tabId: tabId, popup:"info.html?title=URL Changed&originalUrl=" + encodeURIComponent(changeManager.changesByTabId[tabId].originalUrl)});
      // Once we've updated the pageAction, we should clear out the change for that tab
      // so that it does not show for any subsequent navigation (re-load, etc)
      changeManager.clearTab(tabId);
    }
  },

  // If we made changes to a URL for a tab, let's keep that information around so that
  // we can show the pageAction at the appropriate time
  storeChanges: function(tabId, originalUrl, cleansedUrl) {
    changeManager.changesByTabId[tabId] = {
      originalUrl: originalUrl,
      cleansedUrl: cleansedUrl
    };
  }
};


// Function to set/unset handlers for our stripping methods
function setHandlers() {
  // Remove any other listeners
  for (let method in STUFF_BY_STRIPPING_METHOD_ID) {
    STUFF_BY_STRIPPING_METHOD_ID[method]['remove']();
  }
  // Add the listener the user wants
  STUFF_BY_STRIPPING_METHOD_ID[STRIPPING_METHOD_TO_USE]['add']();
}


// Get all the options from storage and put them into their globals
function restoreOptionsFromStorage() {
  return getOptionsFromStorage(items => {
    STRIPPING_METHOD_TO_USE = items.STRIPPING_METHOD_TO_USE || STRIPPING_METHOD_HISTORY_CHANGE;
    SKIP_KNOWN_REDIRECTS    = items.SKIP_KNOWN_REDIRECTS ? true : false;
    // Set the handler now that we know what method we'd like to use
    setHandlers();
  });
}

// Handle messages from other parts of the extension
function messageHandler(message, sender) {
  // User has updated their options/preferences
  if (message.action === ACTION_OPTIONS_SAVED) {
    STRIPPING_METHOD_TO_USE = parseInt(message.options.STRIPPING_METHOD_TO_USE);
    SKIP_KNOWN_REDIRECTS = message.options.SKIP_KNOWN_REDIRECTS;
    setHandlers();
  }

  // User would like to re-load with params allowed
  if (message.action === ACTION_RELOAD_AND_ALLOW_PARAMS) {
    if (!message.url) {
      return;
    }

    // Add this URL to the list of exceptions.
    exceptionsManager.addUrlException(message.url);

    // Re-load this full URL in the tab
    chrome.tabs.update({
      //tabId: DON'T NEED B/C DEFAULT IS CURRENT ACTIVE TAB
      url: message.url
    });
  }
}

// Do anything we need to do when this extension is installed/updated
function onInstallHandler(details) {
  return;
  const reason = details.reason;
  if (reason === REASON_UPDATE || reason === REASON_INSTALL) {
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html?reason=' + reason),
      active: true
    });
  }
}


// OK, finally let's:
// 1) Restore the options from storage
restoreOptionsFromStorage();
// 2) Listen for messages: from the Options page or from the PageAction
chrome.runtime.onMessage.addListener(messageHandler);
// 3) Do anything we need to do when installed/updated
chrome.runtime.onInstalled.addListener(onInstallHandler);