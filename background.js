function log(msg) {
    console.log(msg);
}

// CONSTS
var STRIPPING_METHOD_HISTORY_CHANGE = 1;
var STRIPPING_METHOD_CANCEL_AND_RELOAD = 2;
var STRIPPING_METHOD_BLOCK_AND_RELOAD = 3;


var STRIPPING_METHOD_TO_USE = STRIPPING_METHOD_HISTORY_CHANGE;

var STRIPPING_METHOD_DESCRIPTIONS_BY_ID = {};
STRIPPING_METHOD_DESCRIPTIONS_BY_ID[STRIPPING_METHOD_HISTORY_CHANGE.toString()] = "History Change [speed: &uarr; privacy: &darr; permissions: &uarr;]";
STRIPPING_METHOD_DESCRIPTIONS_BY_ID[STRIPPING_METHOD_CANCEL_AND_RELOAD.toString()] = "Cancel and Re-load [speed: &darr; privacy: &uarr; permissions: &darr;]";
STRIPPING_METHOD_DESCRIPTIONS_BY_ID[STRIPPING_METHOD_BLOCK_AND_RELOAD.toString()] = "Block and Re-load [speed: &darr; privacy: &uarr; permissions: &uarr;]";

var ADD_REMOVE_LISTENERS_BY_STRIPPING_METHOD_ID = {};
ADD_REMOVE_LISTENERS_BY_STRIPPING_METHOD_ID[STRIPPING_METHOD_HISTORY_CHANGE.toString()] = {
    'add': function() {
        chrome.tabs.onUpdated.addListener(history_change_handler);
    },
    'remove': function() {
        chrome.tabs.onUpdated.removeListener(history_change_handler);
    }
};
ADD_REMOVE_LISTENERS_BY_STRIPPING_METHOD_ID[STRIPPING_METHOD_CANCEL_AND_RELOAD.toString()] = {
    'add': function() {
        chrome.tabs.onUpdated.addListener(cancel_and_reload_handler);
    },
    'remove': function() {
        chrome.tabs.onUpdated.removeListener(cancel_and_reload_handler);
    }
};
ADD_REMOVE_LISTENERS_BY_STRIPPING_METHOD_ID[STRIPPING_METHOD_BLOCK_AND_RELOAD.toString()] = {
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








// More detailed string pattern suffixes, stored by their common root.
var trackers_by_root = {
    "utm_": [
        "source",
        "medium",
        "term",
        "campaign",
        "content",
        "cid",
        "reader"

    ],
    "mkt_": [
        "tok"
    ]
};

// Go through all the trackers by their root and turn them into a big regex...
var regexes_by_root = {};
for (var root in trackers_by_root) {
    regexes_by_root[root] = new RegExp("([\?\&]" + root + "(" + trackers_by_root[root].join('|') + ")=[^&#]+)", "ig");
}

function generate_patterns_array() {
    var array = [];
    for (var root in trackers_by_root) {
        for( var i=0; i<trackers_by_root[root].length; i++) {
            array.push( "*://*/*" + root + trackers_by_root[root][i] + "=*" );
        }
    }
    return array;
}

function remove_trackers_from_url(url) {
    var params_index = url.indexOf('?');
    if(params_index == -1) {
        return url;
    }

    // Go through all the pattern roots
    for (var root in regexes_by_root ) {
        // If we see the root, then we should probably try to do some replacements
        if (url.indexOf(root) > params_index) {
            url = url.replace( regexes_by_root[ root ], '');
            // If we've collapsed the URL to the point where there's an '&' against the '?'
            // then we need to get rid of that.
            if (url.charAt(params_index) === '&') {
                url = url.substr(0, params_index) + '?' + url.substr(params_index + 1);
            }
        }
    }
    return url;
}






function history_change_handler(tabId, changeInfo, tab) {
    if (!changeInfo.url) {
        return;
    }
    var original_url = tab.url;
    var cleansed_url = remove_trackers_from_url(original_url);
    if (original_url != cleansed_url) {
        chrome.tabs.executeScript(tabId, {code: "history.pushState(history.state, document.title, '" + cleansed_url + "');"});
    }
}

function cancel_and_reload_handler(tabId, changeInfo, tab) {
    if (!changeInfo.url) {
        return;
    }
    var original_url = tab.url;
    var cleansed_url = remove_trackers_from_url(original_url);
    if (original_url != cleansed_url) {
        chrome.tabs.update(tabId, {url: cleansed_url});
    }
}

function block_and_reload_handler(details) {
    if (!details.url) {
        return {};
    }
    var original_url = details.url;
    var cleansed_url = remove_trackers_from_url(original_url);
    if (original_url != cleansed_url) {
        return { redirectUrl: cleansed_url };
    }
    return {};
}

function set_handlers() {
    for(method in ADD_REMOVE_LISTENERS_BY_STRIPPING_METHOD_ID) {
        ADD_REMOVE_LISTENERS_BY_STRIPPING_METHOD_ID[method]['remove']();
    }
    ADD_REMOVE_LISTENERS_BY_STRIPPING_METHOD_ID[STRIPPING_METHOD_TO_USE]['add']();
}

function restore_options() {
    chrome.storage.sync.get({
        'STRIPPING_METHOD_TO_USE': STRIPPING_METHOD_HISTORY_CHANGE },
        function(items) {
            STRIPPING_METHOD_TO_USE = items.STRIPPING_METHOD_TO_USE;
            set_handlers();
        }
    );
}




function listen_for_messsages(message, sender) {
    if( message.action == 'options_saved') {
        var new_method_to_use = parseInt(message.options.stripping_method);
        STRIPPING_METHOD_TO_USE = new_method_to_use;
        set_handlers();
    }
}



chrome.runtime.onMessage.addListener(listen_for_messsages);
restore_options();