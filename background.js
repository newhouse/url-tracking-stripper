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
for (var root in trackers_by_root ) {
    regexes_by_root[root] = new RegExp("([\?\&]" + root + "(" + trackers_by_root[root].join('|') + ")=[^&#]+)", "ig");
}



// Monitor for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // If what happened to this tab was not a url change, then we're done.
    if ( !changeInfo.url ) {
        return;
    }

    var tab_url = tab.url;
    var params_index = tab.url.indexOf('?');

    // Go through all the pattern roots
    for (var root in regexes_by_root ) {
        // If we see the root, then we should probably try to do some replacements
        if (tab_url.indexOf(root) > params_index) {
            var tab_url = tab_url.replace( regexes_by_root[ root ], '');
            // If we've collapsed the URL to the point where there's an '&' against the '?'
            // then we need to get rid of that.
            if (tab_url.charAt(params_index) === '&') {
                tab_url = tab_url.substr(0, params_index) + '?' + tab_url.substr(params_index + 1);
            }
        }
    }

    // If we ended up making a change to the URL, let's perform a history.pushState to change the URL
    // without a page reload
    if (tab_url != tab.url) {
        chrome.tabs.executeScript(tab.id, {code: "history.pushState(history.state, document.title, '" + tab_url + "');"});
    }
});
