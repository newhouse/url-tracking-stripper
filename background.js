// Helper function to log things
function log(msg) {
    console.log(msg);
}

// CONSTS
var STRIPPING_METHOD_HISTORY_CHANGE     = 1;
var STRIPPING_METHOD_CANCEL_AND_RELOAD  = 2;
var STRIPPING_METHOD_BLOCK_AND_RELOAD   = 3;

// SHOULD WE SKIP GOOGLE SEARCH RESULTS PAGE REDIRECTS AND GO RIGHT TO THE TARGET?
let SKIP_GOOGLE_REDIRECTS = true;

// What method are we using?  Defaults to history change
var STRIPPING_METHOD_TO_USE = STRIPPING_METHOD_HISTORY_CHANGE;

// Store some things in various ways for centralized definitiion of what's available.
var STUFF_BY_STRIPPING_METHOD_ID = {};
STUFF_BY_STRIPPING_METHOD_ID[STRIPPING_METHOD_HISTORY_CHANGE.toString()] = {
    'html': "History Change [speed: &uarr; privacy: &darr; permissions: &uarr;]",
    'add': function() {
        // Monitor tab updates so that we may update the history/url to not contain tracking params
        chrome.tabs.onUpdated.addListener(history_change_handler);
    },
    'remove': function() {
        chrome.tabs.onUpdated.removeListener(history_change_handler);
    }
};
STUFF_BY_STRIPPING_METHOD_ID[STRIPPING_METHOD_CANCEL_AND_RELOAD.toString()] = {
    'html': "Cancel and Re-load [speed: &darr; privacy: &uarr; permissions: &darr;]",
    'add': function() {
        // Monitor tab updates so that we may cancel and re-load them without tracking params
        chrome.tabs.onUpdated.addListener(cancel_and_reload_handler);
        // Monitor for subsequent Navigations so that we may indicate if a change
        // was made or not.
        chrome.webNavigation.onCompleted.addListener(web_navigation_monitor);
    },
    'remove': function() {
        chrome.tabs.onUpdated.removeListener(cancel_and_reload_handler);
        chrome.webNavigation.onCompleted.removeListener(web_navigation_monitor);

    }
};
STUFF_BY_STRIPPING_METHOD_ID[STRIPPING_METHOD_BLOCK_AND_RELOAD.toString()] = {
    'html': "Block and Re-load [speed: &darr; privacy: &uarr; permissions: &uarr;]",
    'add': function() {
        // We are only concerned with URLs that appear to have tracking parameters in them
        // and are in the main frame
        var filters = {
            urls: generate_patterns_array(),
            types: ["main_frame"]
        }
        var extra = ["blocking"];
        // Monitor WebRequests so that we may block and re-load them without tracking params
        chrome.webRequest.onBeforeRequest.addListener(block_and_reload_handler, filters, extra);
        // Monitor for subsequent Navigations so that we may indicate if a change
        // was made or not.
        chrome.webNavigation.onCompleted.addListener(web_navigation_monitor);

    },
    'remove': function() {
        chrome.webRequest.onBeforeRequest.removeListener(block_and_reload_handler);
        chrome.webNavigation.onCompleted.removeListener(web_navigation_monitor);
    }
};


// Go through all the trackers by their root and turn them into a big regex...
var regexes_by_root = {};
for (var root in trackers_by_root) {
    regexes_by_root[root] = new RegExp("((^|&)" + root + "(" + trackers_by_root[root].join('|') + ")=[^&#]+)", "ig");
}

// Generate the URL patterns used for webRequest filtering
// https://developer.chrome.com/extensions/match_patterns
function generate_patterns_array() {
    const array = [];
    for (var root in trackers_by_root) {
        for (var i=0; i < trackers_by_root[root].length; i++) {
            array.push( "*://*/*?*" + root + trackers_by_root[root][i] + "=*" );
        }
    }
    // Add a pattern that matches Google SERP links if the User has allowed this feature.
    if (SKIP_GOOGLE_REDIRECTS) {
        array.push("*://*.google.com/url?*url=*");
    }

    return array;
}

// Actually strip out the tracking codes/parameters from a URL and return the cleansed URL
function remove_trackers_from_url(url) {
    const url_pieces = url.split('?');
    // If no params, nothing to modify
    if (url_pieces.length === 1) {
        return url;
    }

    // Go through all the pattern roots
    for (let root in regexes_by_root) {
        // If we see the root in the params part, then we should probably try to do some replacements
        if (url_pieces[1].indexOf(root) !== -1) {
            url_pieces[1] = url_pieces[1].replace(regexes_by_root[ root ], '');
        }
    }

    // If we've collapsed the URL to the point where there's an '&' against the '?'
    // then we need to get rid of that.
    while (url_pieces[1].charAt(0) === '&') {
        url_pieces[1] = url_pieces[1].substr(1);
    }

    return url_pieces[1] ? url_pieces.join('?') : url_pieces[0];
}

// Let's check a URL to see if there's anything to strip from it. Will return
// false if there was nothing to strip out
function check_url_for_trackers(original_url) {
    // If the URL is "excepted", that means we should not try to strip any junk
    // from it, so we're done here.
    if (exceptionsManager.isExceptedUrl(original_url)) {
        return false;
    }

    // The URL to cleanse starts out as the original URL
    let url_to_cleanse      = original_url;
    // The cleansed URL starts out as false
    let cleansed_url        = false;
    // Let's see if a Google Search Results target can/should be extracted
    const google_target_url = extract_google_target(url_to_cleanse);

    // If there was a Google Search target URL, then let's swap out
    // both the url_to_cleanse and the cleansed_url with that
    if (google_target_url) {
        url_to_cleanse  = google_target_url;
        cleansed_url    = google_target_url;
    }

    // See if there is anything to strip from the URL to cleanse, else use whatever
    // we already have stored in 'cleansed_url'
    cleansed_url = remove_trackers_from_url(url_to_cleanse) || cleansed_url;

    // If it looks like we altered the URL, return a cleansed URL, otherwise false
    return (original_url != cleansed_url) ? cleansed_url : false;

}

// Let's see if this URL is a Google Search Results Page URL, and if so try to
// extract the target URL from it.
function extract_google_target(url) {
    // If skipping of Google Redirects is not enabled OR the URL doesn't look right
    // just return false and be done.
    if (!(SKIP_GOOGLE_REDIRECTS && url.startsWith('https://www.google.com/url?'))) {
        return false;
    }

    // Starts out returning false
    let target = false;

    // Split the URL at the '?' to get the query string
    const query_string = url.split('?')[1];

    // If we have a query string...
    if (query_string) {
        // Get the key/value pairs from the query string
        const key_vals = query_string.split('&');
        // Figure out how many pairs we have
        const kvs_length = key_vals.length;
        // For each iteration fo the loop
        let kv;

        for(let i=0; i < kvs_length; i++) {
            // Get this key/value pair and split it up into its pieces
            kv = key_vals[i].split('=');
            // We are looking for "url=blahblahblah", so see if this is the one
            if (kv[0] === 'url' && typeof kv[1] === 'string') {
                // Decode this URL and save it as the target
                target = decodeURIComponent(kv[1]) || false;
                // Set i really high so we break the loop
                i = kvs_length;
            }
        }
    }

    return target;
}


// Handler for doing History Change approach
function history_change_handler(tabId, changeInfo, tab) {
    // If the change was not to the URL, we're done.
    if (!changeInfo.url) {
        return;
    }

    // Returns false if we didn't replace antyhing
    const cleansed_url = check_url_for_trackers(tab.url);

    if (cleansed_url) {
        // Execute script in that tab to update the History
        chrome.tabs.executeScript(tabId, {
            code: "history.pushState(history.state, document.title, '" + cleansed_url + "');"
        });

        // Save the fact that we stripped something for indication later on.
        changeManager.storeChanges(tab.id, tab.url, cleansed_url);
        // And then immediately indicate this fact since WebNavigation has already
        // taken place since there's no other possible hook.
        changeManager.indicateChange(tab.id, cleansed_url);
    }
}

// Handler for doing Cancel and Re-load approach
function cancel_and_reload_handler(tabId, changeInfo, tab) {
    // If the change was not to the URL, we're done.
    if (!changeInfo.url) {
        return;
    }

    // Returns false if we didn't replace anything, but let's use what
    // we had for cleansed_url in that case as it could have
    const cleansed_url = check_url_for_trackers(tab.url);

    if (cleansed_url) {
        // Update the URL for that tab.
        chrome.tabs.update(tabId, {url: cleansed_url});
        // Save the fact that we stripped something for indication later on.
        // Actually pass the original URL here so that it can be show in the
        // indication on the Page Action
        changeManager.storeChanges(tab.id, tab.url, cleansed_url);
    }
}

// Handler for doing Block Web-request and Re-load approach
function block_and_reload_handler(details) {
    if (!details.url) {
        return {};
    }

    // Returns false if we didn't replace anything, but let's use what
    // we had for cleansed_url in that case as it could have
    const cleansed_url = check_url_for_trackers(details.url);

    if (cleansed_url) {
        // Save the fact that we stripped something for indication later on.
        changeManager.storeChanges(details.tabId, details.url, cleansed_url);
        // Redirect the browser to the cleansed URL and be done here
        return { redirectUrl: cleansed_url };
    }
    // Return an empty object, which indicates we're not blocking/redirecting this
    // request
    return {};
}

// We may need to monitor navigation so that we can let the user know when we've
// stripped something from a URL
var web_navigation_monitor = function(details) {
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
var exceptionsManager = {
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
        var index = exceptionsManager.url_exceptions.indexOf(url);
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

var changeManager = {
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
function set_handlers() {
    // Remove any other listeners
    for (method in STUFF_BY_STRIPPING_METHOD_ID) {
        STUFF_BY_STRIPPING_METHOD_ID[method]['remove']();
    }
    // Add the listener the user wants
    STUFF_BY_STRIPPING_METHOD_ID[STRIPPING_METHOD_TO_USE]['add']();
}


// Get all the options from storage and put them into their globals
function restore_options_from_storage() {
    chrome.storage.sync.get(
        {
            'STRIPPING_METHOD_TO_USE': STRIPPING_METHOD_HISTORY_CHANGE,
            'SKIP_GOOGLE_REDIRECTS': false
        },
        function(items) {
            STRIPPING_METHOD_TO_USE = items.STRIPPING_METHOD_TO_USE || STRIPPING_METHOD_HISTORY_CHANGE;
            SKIP_GOOGLE_REDIRECTS = items.SKIP_GOOGLE_REDIRECTS ? true : false;
            // Set the handler now that we know what method we'd like to use
            set_handlers();
        }
    );
}

function listen_for_messsages(message, sender) {
    // User has updated their options/preferences
    if (message.action == 'options_saved') {
        STRIPPING_METHOD_TO_USE = parseInt(message.options.STRIPPING_METHOD_TO_USE);
        SKIP_GOOGLE_REDIRECTS = message.options.SKIP_GOOGLE_REDIRECTS;
        set_handlers();
    }

    // User would like to re-load with params allowed
    if (message.action == 'reload_and_allow_params') {
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


// OK, finally let's:
// 1) Restore the options from storage
restore_options_from_storage();
// 2) Listen for messages: from the Options page or from the PageAction
chrome.runtime.onMessage.addListener(listen_for_messsages);
