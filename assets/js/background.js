'use strict';

const {
  getOptionsFromStorage,
}                                               = require('./common');

const {
  removeTrackersFromUrl,
}                                               = require('./trackers');

const {
  REDIRECT_DATA_BY_TARGET_PARAM,
  extractRedirectTarget,
  followRedirect,
}                                               = require('./redirects');

const {
  DOMAIN_RULES,
}                                               = require('./rules');

const {
  REASON_INSTALL,
  REASON_UPDATE,
  STORAGE_KEY_STRIPPING_METHOD_TO_USE,
  STORAGE_KEY_SKIP_KNOWN_REDIRECTS,
  ACTION_OPTIONS_SAVED,
  ACTION_RELOAD_AND_ALLOW_PARAMS,
  ACTION_GET_STUFF_BY_STRIPPING_METHOD_ID,
  DEFAULT_STRIPPING_METHOD,
  STRIPPING_METHOD_HISTORY_CHANGE,
  STRIPPING_METHOD_CANCEL_AND_RELOAD,
  STRIPPING_METHOD_BLOCK_AND_RELOAD,
  STRIPPING_METHOD_BLOCK_AND_RELOAD_SKIP_REDIRECTS,
  CHANGE_TYPE_REDIRECT_SKIP,
  CHANGE_TYPE_TRACKING_STRIP,
  CHANGE_TYPE_BEEN_CHECKED,
  CONTEXT_MENU_COPY_CLEAN_ID,
  CONTEXT_MENU_COPY_CLEAN_TEXT,
  CONTEXT_MENU_CLEAN_AND_GO_ID,
  CONTEXT_MENU_CLEAN_AND_GO_TEXT
}                                               = require('./consts');



// What method are we using?  Starts with the default
let STRIPPING_METHOD_TO_USE = DEFAULT_STRIPPING_METHOD;
// Are these context menu items enabled? Start out true.
let CONTEXT_MENU_COPY_CLEAN_ENABLED = true;
let CONTEXT_MENU_CLEAN_AND_GO_ENABLED = true;

// STORE ANY REDIRECT HANDLER FUNCTIONS HERE SO THAT THEY CAN BE UNREGISTERED
// IF NEED BE
const BLOCK_AND_REDIRECT_HANDLERS = [];
const REDIRECT_HANDLERS = [];

// An element to store text for clipboard writing
let clipper;

// Store some things in various ways for centralized definitiion of what's available.
const STUFF_BY_STRIPPING_METHOD_ID = {
  [STRIPPING_METHOD_HISTORY_CHANGE]: {
    html: "History Change (cosmetic only)",
    // Monitor tab updates so that we may update the history/url to not contain tracking params
    add: () => chrome.tabs.onUpdated.addListener(historyChangeHandler),
    remove: () => chrome.tabs.onUpdated.removeListener(historyChangeHandler),
  },
  [STRIPPING_METHOD_BLOCK_AND_RELOAD]: {
    html: "Block and Re-load (increased privacy)",
    add: registerBlockAndReloadHandlers,
    remove: unRegisterBlockAndReloadHandlers
  },
  [STRIPPING_METHOD_BLOCK_AND_RELOAD_SKIP_REDIRECTS]: {
    html: "Block and Re-load + Skip Redirects (most privacy!)",
    add: () => {
      registerRedirectHandlers();
      registerBlockAndReloadHandlers();
    },
    remove: () => {
      unRegisterRedirectHandlers();
      unRegisterBlockAndReloadHandlers();
    }
  }
};


/*******************************************************
*      ___        _ _            _
*     | _ \___ __| (_)_ _ ___ __| |_ ___
*     |   / -_) _` | | '_/ -_) _|  _(_-<
*     |_|_\___\__,_|_|_| \___\__|\__/__/
*     / __| |_ _  _ / _|/ _|
*     \__ \  _| || |  _|  _|
*     |___/\__|\_,_|_| |_|
*
*/

// Remove the listeners, if any, that we added to watch for redirect-skipping.
function unRegisterRedirectHandlers() {
  let handler;
  // eslint-disable-next-line no-cond-assign
  while (handler = REDIRECT_HANDLERS.pop()) {
    chrome.webRequest.onBeforeRequest.removeListener(handler);
  }
}


// Add listeners to watch for redirect-skipping opportunities
function registerRedirectHandlers() {
  // Remove any existing ones before we get started
  unRegisterRedirectHandlers();

  for (let targetParam in REDIRECT_DATA_BY_TARGET_PARAM) {
    const {
      patterns: urls,
      types,
      paramDelimiters = ['&'],
    } = REDIRECT_DATA_BY_TARGET_PARAM[targetParam];

    // Don't do anything stupid.
    if (!(urls && urls.length && types && types.length)) {
      continue;
    }

    const filters = {
      urls,
      types,
    };
    const extra = ["blocking"];

    const handler = details => {
      // If this is to be excepted this time, then do not block.
      if (exceptionsManager.isExceptedUrl(details.url)) {
        return {};
      }

      const targetUrl = extractRedirectTarget(details.url, targetParam, paramDelimiters);
      if (!targetUrl) {
        return {};
      }

      // OK we found a known redirect and we should skip it.
      // Save the fact that we stripped something for indication later on.
      changeManager.storeChanges(details.tabId, details.url, targetUrl, CHANGE_TYPE_REDIRECT_SKIP);
      // Return this redirect URL in order to actually redirect the tab
      return { redirectUrl: targetUrl };
    };

    // SAVE DAT FUNCTION SO WE CAN UNREGISTER IT LATER
    REDIRECT_HANDLERS.push(handler);
    // REGISTER IT AS A LISTENER
    chrome.webRequest.onBeforeRequest.addListener(handler, filters, extra);
  }
}

//
//
//*******************************************************



/*******************************************************
*      _____            _
*     |_   _| _ __ _ __| |_____ _ _
*       | || '_/ _` / _| / / -_) '_|
*      _|_||_| \__,_\__|_\_\___|_|
*     / __| |_ _  _ / _|/ _|
*     \__ \  _| || |  _|  _|
*     |___/\__|\_,_|_| |_|
*
*/

// Let's check a URL to see if there's anything to strip from it. Will return
// false if there was nothing to strip out
function checkUrlForTrackers(originalUrl, trackers) {
  // If the URL is "excepted", that means we should not try to strip any junk
  // from it, so we're done here.
  if (exceptionsManager.isExceptedUrl(originalUrl)) {
    return false;
  }

  // The URL to cleanse starts out as the original URL
  const cleansedUrl = removeTrackersFromUrl(originalUrl, trackers);

  // If it looks like we altered the URL, return a cleansed URL, otherwise false
  return (cleansedUrl && cleansedUrl != originalUrl) ? cleansedUrl : false;
}

// Helper to do both redirect following and tracker removal
// in certain situations.
function followRedirectAndRemoveTrackers(url) {
  return removeTrackersFromUrl(followRedirect(url));
}

//
//
//*******************************************************


/*******************************************************
*      _  _              _ _
*     | || |__ _ _ _  __| | |___ _ _ ___
*     | __ / _` | ' \/ _` | / -_) '_(_-<
*     |_||_\__,_|_||_\__,_|_\___|_| /__/
*
*/
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
    changeManager.storeChanges(tab.id, tab.url, cleansedUrl, CHANGE_TYPE_TRACKING_STRIP);
    // And then immediately indicate this fact since WebNavigation has already
    // taken place since there's no other possible hook.
    changeManager.indicateChange(tab.id, cleansedUrl);
  }
}


// Unregiser the Block and Reload Handler
function unRegisterBlockAndReloadHandlers() {
  let handler;
  // eslint-disable-next-line no-cond-assign
  while (handler = BLOCK_AND_REDIRECT_HANDLERS.pop()) {
    chrome.webRequest.onBeforeRequest.removeListener(handler);
  }
  chrome.webNavigation.onCompleted.removeListener(webNavigationMonitor);
}


// Register the Block and Reload Handlers
function registerBlockAndReloadHandlers() {
  // Unregister the handlers before re-registering them
  unRegisterBlockAndReloadHandlers();

  // It seems to me that there are 3 approaches here:
  // (Option A)
  //    1) Register 1 listener with 1 URL that intercepts all URLs.
  //    2) Determine if the hostname matches any in the config
  //    3) Remove any applicable trackers
  //
  //    Pros:
  //      - Just 1 listener registered, so only 1 called.
  //      - Just 1 URL pattern, so less load on Chrome.
  //      - Simpler.
  //
  //    Cons:
  //      - Many non-matching URLs will be passed to this.
  //      - As the list of domain overrides increases, the time complexity
  //        of this will increase...in JS.
  //      - Feels very naive.
  //
  // (Option B)
  //    1) Register 1 listener with many URLs: 1 for each tracker that will
  //       match any host
  //    2) Determine which config the hostname matches (it ought to be at least 1
  //       with the default * being the final option)
  //    3) Remove any applicable trackers.
  //
  //    Pros:
  //      - Just 1 listener registered, so only 1 called.
  //      - Much more targeted: there's a very high chance that something will need
  //        to be removed.
  //
  //    Cons:
  //       - Many URLs patterns, so more load on Chrome.
  //       - As the list of domain overrides increases, the time complexity
  //         of this will increase...in JS.
  //
  // (Option C)
  //    1) Register many listeners with many URLs:
  //       1 listener for each domain, with many URLs for each tracker in that domain's config
  //    2) Trackers to remove are contained in the callback for the listener, and are removed.
  //
  //    Pros:
  //      - Extremely targeted: every time this is called, something should be removed
  //      - Constant time in JS-land: no need to loop through domain overrides each time.
  //
  //    Cons:
  //      - Registering lots of listeners
  //      - Many URLs patterns, so more load on Chrome.
  //

  const starDomainRule = DOMAIN_RULES[DOMAIN_RULES.length - 1];

  DOMAIN_RULES.forEach(domainRule => {
    const urlPatterns = domainRule.generateUrlPatterns();
    const trackers = domainRule.getApplicableTrackers();
    const hostPatterns = domainRule.generateHostPatterns();

    // Actually try to remove tracking...
    const realHandler = details => (blockAndReloadHandler(details, trackers));
    // Fires as a backup to ensure that other domain rules (namely the * rule) don't
    // strip things in case the domain-specific rule's trackers were not matched
    // and passed to the real handler
    const decoyHandler = details => (changeManager.storeChanges(details.tabId, details.url, details.url, CHANGE_TYPE_BEEN_CHECKED));

    const tuples = [[urlPatterns, realHandler]];
    // Only add the decoy if it's not the * domain rule
    if (domainRule !== starDomainRule) {
      tuples.push([hostPatterns, decoyHandler]);
    }

    // Register these
    tuples.forEach(([urls, handler]) => {
      const filters = {
        urls,
        types: ["main_frame"]
      };
      const extra = ["blocking"];

      // Store this handler for later so that it can be unregistered
      BLOCK_AND_REDIRECT_HANDLERS.push(handler);

      // Monitor WebRequests so that we may block and re-load them without tracking params
      chrome.webRequest.onBeforeRequest.addListener(handler, filters, extra);
    });
  });

  // Monitor for subsequent Navigations so that we may indicate if a change
  // was made or not.
  chrome.webNavigation.onCompleted.addListener(webNavigationMonitor);
}


// Handler for doing Block Web-request and Re-load approach
function blockAndReloadHandler(details, trackers) {
  if (!(details && details.url)) {
    return {};
  }

  const {
    tabId
  } = details;

  // Has another handler already been run? If so, do nothing more.
  const tabHasChangeForAnyOfTypes = changeManager.tabHasChangeForAnyOfTypes(tabId, [CHANGE_TYPE_TRACKING_STRIP, CHANGE_TYPE_BEEN_CHECKED]);
  // Don't do anything
  if (tabHasChangeForAnyOfTypes) {
    return {};
  }

  // Returns false if we didn't replace anything
  const cleansedUrl = checkUrlForTrackers(details.url, trackers);

  // If no cleaned URL then there's nothing to do to this request
  if (!cleansedUrl) {
    changeManager.storeChanges(details.tabId, details.url, cleansedUrl, CHANGE_TYPE_BEEN_CHECKED);
    return {};
  }

  // OK, there was some tracking in the URL so we need to block this and re-load
  // a cleansed URL.

  // Save the fact that we stripped something for indication later on.
  changeManager.storeChanges(details.tabId, details.url, cleansedUrl, CHANGE_TYPE_TRACKING_STRIP);
  // Redirect the browser to the cleansed URL and be done here
  return {
    redirectUrl: cleansedUrl,
  };
}


// Function to set/unset handlers for our stripping methods
function setHandlers() {
  // Remove any other listeners
  for (let method in STUFF_BY_STRIPPING_METHOD_ID) {
    STUFF_BY_STRIPPING_METHOD_ID[method]['remove']();
  }
  // Add the listener the user wants
  STUFF_BY_STRIPPING_METHOD_ID[STRIPPING_METHOD_TO_USE]['add']();

  // Let Chrome know that things may be different this time around.
  // Actually, it says: "You don't need to call handlerBehaviorChanged() after registering or unregistering an event listener."
  // https://developer.chrome.com/extensions/webRequest#method-handlerBehaviorChanged
  // chrome.webRequest.handlerBehaviorChanged();
}


// Handle messages from other parts of the extension
function messageHandler(message, sender, cb) {

  // User has updated their options/preferences
  if (message.action === ACTION_OPTIONS_SAVED) {

    STRIPPING_METHOD_TO_USE = parseInt(message.options[STORAGE_KEY_STRIPPING_METHOD_TO_USE]) || DEFAULT_STRIPPING_METHOD;
    // If either of these are undefined, use a default. Otherwise use the values themselves.
    CONTEXT_MENU_COPY_CLEAN_ENABLED = typeof message.options[CONTEXT_MENU_COPY_CLEAN_ID] == 'undefined' ? true : message.options[CONTEXT_MENU_COPY_CLEAN_ID];
    CONTEXT_MENU_CLEAN_AND_GO_ENABLED = typeof message.options[CONTEXT_MENU_CLEAN_AND_GO_ID] == 'undefined' ? true : message.options[CONTEXT_MENU_CLEAN_AND_GO_ID];

    // Set the handlers to do what they do
    setHandlers();

    // (Re-)Create the context menus
    createContextMenus();

    // Save these new options to storage in case of restart or update, then call
    // the callback
    chrome.storage.sync.set(
      {
        [STORAGE_KEY_STRIPPING_METHOD_TO_USE]: STRIPPING_METHOD_TO_USE,
        [CONTEXT_MENU_COPY_CLEAN_ID]: CONTEXT_MENU_COPY_CLEAN_ENABLED,
        [CONTEXT_MENU_CLEAN_AND_GO_ID]: CONTEXT_MENU_CLEAN_AND_GO_ENABLED
      },
      cb
    );

    // Return true to make the callback callable asynchronously. A bit unnecssary
    // at the moment, but may be useful some day.
    // https://developer.chrome.com/extensions/runtime#event-onMessage
    return true;
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

  // Options page probably wants all the stuff for creating the radio buttons
  if (message.action === ACTION_GET_STUFF_BY_STRIPPING_METHOD_ID) {
    // Send it back.
    cb(STUFF_BY_STRIPPING_METHOD_ID);
    // Return false so we don't keep the connection open as there's nothing
    // async happening inside here
    return false;
  }
}


// Do anything we need to do when this extension is installed/updated
function onInstallHandler(details) {
  const reason = details.reason;

  // If it's an Update or an Install
  if (reason === REASON_UPDATE || reason === REASON_INSTALL) {

    // Let the User know about things
    // chrome.tabs.create({
    //   url: chrome.runtime.getURL('welcome.html?reason=' + reason),
    //   active: true
    // });
  }

  if (reason === REASON_UPDATE ) {
    // Remove the Skip Known Redirects entry from storage in case it's there.
    chrome.storage.sync.remove(STORAGE_KEY_SKIP_KNOWN_REDIRECTS);
  }
}

//
//
//*******************************************************




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
  // eslint-disable-next-line no-unused-vars
  chrome.tabs.get(details.tabId, function(tab) {
    // Problems are caught by the runtime.lastError mechanism
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

    // We have an exeption here!
    exceptionsManager.url_exceptions.splice(index,1);
    return true;
  }
};


const changeManager = {
  // We'll store URL change information by tab id
  changesByTabId: {},

  // Clear URL change information for a given tab
  clearTab: function(tabId) {
    delete changeManager.changesByTabId[tabId];
  },

  // Check to see if it looks like we changed the URL for a tab, and update/display
  // the pageAction if so
  // eslint-disable-next-line no-unused-vars
  indicateChange: function(tabId, cleansedUrl) {
    // Get the changes for this tabId
    const changes = (changeManager.changesByTabId[tabId] || []).filter(change => {
      return change && change.type != CHANGE_TYPE_BEEN_CHECKED;
    });

    if (changes.length > 0) {
      const title = 'URL Changed!';
      // Show the pageAction for this tab
      chrome.pageAction.show(tabId);
      // Set the title for it
      chrome.pageAction.setTitle({
        tabId,
        title
      });

      // Pass a bunch of stuff in the URL
      const url = `info.html?title=${encodeURIComponent(title)}&changes=${encodeURIComponent(JSON.stringify(changes))}`;
      // We can pass params into the URL like any other webpage, which is useful for dynamically generating the content:
      chrome.pageAction.setPopup({tabId: tabId, popup: url});
    }

    // Once we've updated the pageAction, we should clear out the change for that tab
    // so that it does not show for any subsequent navigation (re-load, etc)
    changeManager.clearTab(tabId);
  },

  // If we made changes to a URL for a tab, let's keep that information around so that
  // we can show the pageAction at the appropriate time
  storeChanges: function(tabId, originalUrl, cleansedUrl, type = CHANGE_TYPE_TRACKING_STRIP) {
    changeManager.changesByTabId[tabId] = changeManager.changesByTabId[tabId] || [];
    changeManager.changesByTabId[tabId].push({
      originalUrl,
      cleansedUrl,
      type
    });
  },

  tabHasChangeForAnyOfTypes: (tabId, types) => {
    const changesForTabId = changeManager.changesByTabId[tabId];
    if (!changesForTabId) {
      return false;
    }

    return changesForTabId.some(change => (change && types.includes(change.type)));
  },

  tabHasChangeForType: (tabId, type = CHANGE_TYPE_TRACKING_STRIP) => {
    return this.tabHasChangeForAnyOfTypes(tabId, [type]);
  },
};


// Get all the options from storage and put them into their globals
function restoreOptionsFromStorage() {

  return getOptionsFromStorage(
    // Callback
    items => {

      // Do we need to perform a storage update?
      let performUpdate = false;
      const updateOptions = {};

      // Use the found method
      STRIPPING_METHOD_TO_USE = items[STORAGE_KEY_STRIPPING_METHOD_TO_USE];

      // If it turns out they have no saved method to use OR they were using the deprecated Cancel & Reload Method, then we have to update some things.
      if (!STRIPPING_METHOD_TO_USE || STRIPPING_METHOD_TO_USE === STRIPPING_METHOD_CANCEL_AND_RELOAD) {
        // We need to perform an update
        performUpdate = true;

        // Set the Stripping Method to use in this process to be the default one.
        STRIPPING_METHOD_TO_USE = DEFAULT_STRIPPING_METHOD;

        updateOptions[STORAGE_KEY_STRIPPING_METHOD_TO_USE] = DEFAULT_STRIPPING_METHOD;
      }

      // If there's nothing stored for this context menu item, let's fix that
      if (typeof items[CONTEXT_MENU_COPY_CLEAN_ID] === 'undefined') {
        // We need to perform an update
        performUpdate = true;
        updateOptions[CONTEXT_MENU_COPY_CLEAN_ID] = true;
        CONTEXT_MENU_COPY_CLEAN_ENABLED = true;
      }
      else {
        CONTEXT_MENU_COPY_CLEAN_ENABLED = items[CONTEXT_MENU_COPY_CLEAN_ID];
      }

      // If there's nothing stored for this context menu item, let's fix that
      if (typeof items[CONTEXT_MENU_CLEAN_AND_GO_ID] === 'undefined') {
        // We need to perform an update
        performUpdate = true;
        updateOptions[CONTEXT_MENU_CLEAN_AND_GO_ID] = true;
        CONTEXT_MENU_CLEAN_AND_GO_ENABLED = true;
      }
      else {
        CONTEXT_MENU_CLEAN_AND_GO_ENABLED = items[CONTEXT_MENU_CLEAN_AND_GO_ID];
      }

      // Do we need to perform an update?
      if (performUpdate) {
        // Spoof a message that says the User updated their settings. This will call
        // 'setHandlers' inside it, so we don't need/want to do that twice.
        return messageHandler(
          {
            action: ACTION_OPTIONS_SAVED,
            options: updateOptions
          },
          {}, // No real sender.
          () => {} // No real callback
        );
      }

      // No update necessary - let's just call the handlers etc here and now
      else {
        setHandlers();
        createContextMenus();
      }

    },

    // Get these entries from storage with no defaults so we know if they're there or not
    [STORAGE_KEY_STRIPPING_METHOD_TO_USE, CONTEXT_MENU_COPY_CLEAN_ID, CONTEXT_MENU_CLEAN_AND_GO_ID]
  );
}





// Wrapper to create the context menu items. Have experienced weird permissions
// behavior for updates (not installs), so eventually after a few versions
// this pre-flight-check can probably be removed. v4.1.0
function createContextMenus() {
  // These are the permissions we need
  const permissions = { permissions: ['contextMenus'] };

  // Check to see if we already have them.
  chrome.permissions.contains(permissions, yes => {
    // If we have them, then create the context menu
    if (yes) {
      return _createContextMenus();
    }

    // Let's ask the User then
    return chrome.permissions.request(permissions, granted => {
      // If the User granted it, then add the Context Menu
      if (granted) {
        return _createContextMenus();
      }
    });
  });
}


// Create the Context Menu item for copying links cleanly
function _createContextMenus() {

  // Remove all of our existing context menus
  chrome.contextMenus.removeAll();

  // Make this menu item if we should
  if (CONTEXT_MENU_COPY_CLEAN_ENABLED) {

    // Create the clipper element to be used for selecting
    clipper = document.createElement('div');
    // Add it to the background script's DOM
    document.body.appendChild(clipper);

    // Create the Copy & Clean contextMenu
    // https://developer.chrome.com/extensions/contextMenus#method-create
    chrome.contextMenus.create({
      type: 'normal',
      id: CONTEXT_MENU_COPY_CLEAN_ID,
      title: CONTEXT_MENU_COPY_CLEAN_TEXT,
      // Only happen when the user right-clicks on something link-like
      contexts: ['link'],
      visible: true,
      enabled: true,
      // This will actually only match 'http' OR 'https' schemes:
      // https://developer.chrome.com/extensions/match_patterns
      documentUrlPatterns: ['*://*/*'],
      // The click handler
      onclick: (info) => {
        // If there is no clipper helper element for some reason, forget it.
        if (!clipper) {
          // Remove this context menu since there's a problem, and get out of here.
          return chrome.contextMenus && chrome.contextMenus.removeAll();
        }

        // Extract any redirect in and remove trackers from the URL
        const linkUrl = followRedirectAndRemoveTrackers(info.linkUrl);

        // Make sure we have a link URL still
        if (!linkUrl) {
          return;
        }

        // Do what we need to do to copy this link to the clipboard.
        // https://developers.google.com/web/updates/2015/04/cut-and-copy-commands
        clipper.textContent = linkUrl;
        const range = document.createRange();
        range.selectNode(clipper);
        window.getSelection().addRange(range);

        try {
          if (!document.execCommand('copy')) {
            console.warn('Problem copying', linkUrl, 'to clipboard.');
          }
        }
        catch(err) {
          console.warn('Problem copying', linkUrl, 'to clipboard.');
          console.error(err);
        }

        // Remove the selections - NOTE: Should use
        // removeRange(range) when it is supported
        window.getSelection().removeAllRanges();
      }
    });
  }

  // Make this menu item if we should
  if (CONTEXT_MENU_CLEAN_AND_GO_ENABLED) {

    // Create the Clean & Go contextMenu
    // https://developer.chrome.com/extensions/contextMenus#method-create
    chrome.contextMenus.create({
      type: 'normal',
      id: CONTEXT_MENU_CLEAN_AND_GO_ID,
      title: CONTEXT_MENU_CLEAN_AND_GO_TEXT,
      // Only happen when the user right-clicks on something link-like
      contexts: ['link'],
      visible: true,
      enabled: true,
      // This will actually only match 'http' OR 'https' schemes:
      // https://developer.chrome.com/extensions/match_patterns
      documentUrlPatterns: ['*://*/*'],
      // The click handler
      onclick: (info) => {

        // Extract any redirects in the linkUrl
        const linkUrl = followRedirectAndRemoveTrackers(info.linkUrl);

        // Make sure we have a link URL still
        if (!linkUrl) {
          return;
        }

        // Open that link in a new tab
        chrome.tabs.create({
          url: linkUrl,
          active: true
        });
      }
    });
  }
}



// OK, finally let's:
// 1) Do anything we need to do when installed/updated
chrome.runtime.onInstalled.addListener(onInstallHandler);
// 2) Restore the options from storage
restoreOptionsFromStorage();
// 3) Listen for messages: from the Options page or from the PageAction
chrome.runtime.onMessage.addListener(messageHandler);
