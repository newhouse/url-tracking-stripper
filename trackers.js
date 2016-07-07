// More detailed string pattern suffixes, stored by their common root.
var trackers_by_root = {
    // Google's Urchin Tracking Module
    "utm_": [
        "source",
        "medium",
        "term",
        "campaign",
        "content",
        "cid",
        "reader"

    ],
    // Marketo
    "mkt_": [
        "tok"
    ],
    "nr_": [
        "email_referer"
    ]
};
