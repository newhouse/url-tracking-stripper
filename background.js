function log(msg) {
    console.log(msg);
}

// CONSTS
var STRIPPING_METHOD_HISTORY_CHANGE = 1;
var STRIPPING_METHOD_CANCEL_AND_RELOAD = 2;
var STRIPPING_METHOD_BLOCK_AND_RELOAD = 3;

// What method are we using?  Defaults to history change
var STRIPPING_METHOD_TO_USE = STRIPPING_METHOD_HISTORY_CHANGE;

// Store some things in various ways for centralized definitiion of what's available.
var STUFF_BY_STRIPPING_METHOD_ID = {};
STUFF_BY_STRIPPING_METHOD_ID[STRIPPING_METHOD_HISTORY_CHANGE.toString()] = {
    'html': "History Change [speed: &uarr; privacy: &darr; permissions: &uarr;]",
    'add': function() {
        chrome.tabs.onUpdated.addListener(history_change_handler);
    },
    'remove': function() {
        chrome.tabs.onUpdated.removeListener(history_change_handler);
    }
};
STUFF_BY_STRIPPING_METHOD_ID[STRIPPING_METHOD_CANCEL_AND_RELOAD.toString()] = {
    'html': "Cancel and Re-load [speed: &darr; privacy: &uarr; permissions: &darr;]",
    'add': function() {
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
        var filters = {
            urls: generate_patterns_array(),
            types: ["main_frame"]
        }
        var extra = ["blocking"];
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
function generate_patterns_array() {
    var array = [];
    for (var root in trackers_by_root) {
        for (var i=0; i < trackers_by_root[root].length; i++) {
            array.push( "*://*/*?*" + root + trackers_by_root[root][i] + "=*" );
        }
    }
    return array;
}

// Actually strip out the tracking codes/parameters from a URL and return the cleansed URL
function remove_trackers_from_url(url) {
	var url_pieces = url.split('?');
    // If no params, nothing to modify
    if (url_pieces.length === 1) {
        return url;
    }

    // Go through all the pattern roots
    for (var root in regexes_by_root) {
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
function check_url(original_url) {
    var cleansed_url = remove_trackers_from_url(original_url);
    // If it looks like we altered the URL
    return (original_url != cleansed_url) ? cleansed_url : false;

}

// Handler for doing History Change approach
function history_change_handler(tabId, changeInfo, tab) {
    // If the change was not to the URL, we're done.
    if (!changeInfo.url) {
        return;
    }

	// Returns false if we didn't replace antyhing
    var cleansed_url = check_url(tab.url);
    if (cleansed_url) {
        // Execute script in that tab to update the History
        chrome.tabs.executeScript(tabId, {
            code: "history.pushState(history.state, document.title, '" + cleansed_url + "');"
        });

		// Save the fact that we stripped something for indication later on.
		changeManager.storeChanges(tab.id, tab.url, cleansed_url);
		// And immediately indicate this fact since WebNavigation has already taken place
		// so there's no other hook.
		changeManager.indicateChange(tab.id, cleansed_url);
    }
}

// Handler for doing Cancel and Re-load approach
function cancel_and_reload_handler(tabId, changeInfo, tab) {
    // If the change was not to the URL, we're done.
    if (!changeInfo.url) {
        return;
    }

	// Returns false if we didn't replace antyhing
    var cleansed_url = check_url(tab.url);
    if (cleansed_url) {
        // Update the URL for that tab.
        chrome.tabs.update(tabId, {url: cleansed_url});
		// Save the fact that we stripped something for indication later on.
		changeManager.storeChanges(tab.id, tab.url, cleansed_url);
    }
}

// Handler for doing Block Web-request and Re-load approach
function block_and_reload_handler(details) {
    if (!details.url) {
        return {};
    }

	// Returns false if we didn't replace antyhing
    var cleansed_url = check_url(details.url);
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
			log(chrome.runtime.lastError);
			changeManager.clearTab(details.tabId);
			return;
		}
		// OK, let's see if we likely stripped something from the URL of this page
		changeManager.indicateChange(details.tabId, details.url);
	});
};


var changeManager = {
	changesByTabId: {},
	clearTab: function(tabId) {
		delete changeManager.changesByTabId[tabId];
	},
	indicateChange: function(tabId, cleansedUrl) {
		if (changeManager.changesByTabId[tabId] && changeManager.changesByTabId[tabId].cleansedUrl === cleansedUrl) {
			chrome.pageAction.show(tabId);
			chrome.pageAction.setTitle({
				'tabId': tabId,
				'title': "URL changed from " + changeManager.changesByTabId[tabId].originalUrl
			});
			// We can pass params into the URL like any other webpage, which is useful for dynamically generating the content:
			chrome.pageAction.setPopup({tabId: tabId, popup:"info.html?title=URL Changed&originalUrl=" + encodeURIComponent(changeManager.changesByTabId[tabId].originalUrl)});
			changeManager.clearTab(tabId);
		}
	},
	storeChanges: function(tabId, originalUrl, cleansedUrl) {
		changeManager.changesByTabId[tabId] = {
			originalUrl: originalUrl,
			cleansedUrl: cleansedUrl
		};
	}
};



// Function to set handlers
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
    chrome.storage.sync.get({
        'STRIPPING_METHOD_TO_USE': STRIPPING_METHOD_HISTORY_CHANGE },
        function(items) {
            STRIPPING_METHOD_TO_USE = items.STRIPPING_METHOD_TO_USE || STRIPPING_METHOD_HISTORY_CHANGE;
            // Set the handler now that we know what method we'd like to use
            set_handlers();
        }
    );
}

function listen_for_messsages(message, sender) {
    if (message.action == 'options_saved') {
        STRIPPING_METHOD_TO_USE = parseInt(message.options.STRIPPING_METHOD_TO_USE);
        set_handlers();
    }
}


// OK, finally let's:
// 1) Restore the options from storage
restore_options_from_storage();
// 2) Listen for messages (from the Options page)
chrome.runtime.onMessage.addListener(listen_for_messsages);
