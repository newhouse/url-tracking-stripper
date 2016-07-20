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
	// Simple Reach
	"sr_": [
		"share"
	],
	// Unknown
    "nr_": [
        "email_referer"
    ],
	// Unknown
	"nc": [
		"id"
	]
};
