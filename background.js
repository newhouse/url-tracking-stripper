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
    },
    'remove': function() {
        chrome.tabs.onUpdated.removeListener(cancel_and_reload_handler);
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

    },
    'remove': function() {
        chrome.webRequest.onBeforeRequest.removeListener(block_and_reload_handler);
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
        for (var i=0; i<trackers_by_root[root].length; i++) {
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
    var cleansed_url = check_url(tab.url);
    if (cleansed_url) {
        // Execute script in that tab to update the History
        chrome.tabs.executeScript(tabId, {
            code: "history.pushState(history.state, document.title, '" + cleansed_url + "');"
        });
    }
}

// Handler for doing Cancel and Re-load approach
function cancel_and_reload_handler(tabId, changeInfo, tab) {
    // If the change was not to the URL, we're done.
    if (!changeInfo.url) {
        return;
    }
    var cleansed_url = check_url(tab.url);
    if (cleansed_url) {
        // Update the URL for that tab.
        chrome.tabs.update(tabId, {url: cleansed_url});
    }
}

// Handler for doing Block Web-request and Re-load approach
function block_and_reload_handler(details) {
    if (!details.url) {
        return {};
    }
    var cleansed_url = check_url(details.url);
    if (cleansed_url) {
        return { redirectUrl: cleansed_url };
    }
    return {};
}

// Function to set handlers
function set_handlers() {
    for(method in STUFF_BY_STRIPPING_METHOD_ID) {
        STUFF_BY_STRIPPING_METHOD_ID[method]['remove']();
    }
    STUFF_BY_STRIPPING_METHOD_ID[STRIPPING_METHOD_TO_USE]['add']();
}





// Get all the options from storage and put them into their globals
function restore_options_from_storage() {
    chrome.storage.sync.get({
        'STRIPPING_METHOD_TO_USE': STRIPPING_METHOD_HISTORY_CHANGE },
        function(items) {
            STRIPPING_METHOD_TO_USE = items.STRIPPING_METHOD_TO_USE ? items.STRIPPING_METHOD_TO_USE : STRIPPING_METHOD_HISTORY_CHANGE;
            // Set the handler now that we know what method we'd like to use
            set_handlers();
        }
    );
}

function listen_for_messsages(message, sender) {
    if( message.action == 'options_saved') {
        STRIPPING_METHOD_TO_USE = parseInt(message.options.STRIPPING_METHOD_TO_USE);
        set_handlers();
    }
}


// OK, finally let's:
// 1) Restore the options from storage
restore_options_from_storage();
// 2) Listen for messages (from the Options page)
chrome.runtime.onMessage.addListener(listen_for_messsages);
