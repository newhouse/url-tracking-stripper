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
    if ( !changeInfo.url ) {
        return;
    }

    var tab_url = tab.url;
    var params_index = tab.url.indexOf('?');

    for (var root in regexes_by_root ) {
        if (tab_url.indexOf(root) > params_index) {
            var tab_url = tab_url.replace( regexes_by_root[ root ], '');
            if (tab_url.charAt(params_index) === '&') {
                tab_url = tab_url.substr(0, params_index) + '?' + tab_url.substr(params_index + 1)
            }
        }
    }

    if (tab_url != tab.url) {
        chrome.tabs.executeScript({code: "history.pushState(history.state, document.title, '" + tab_url + "');"});
    }
});
