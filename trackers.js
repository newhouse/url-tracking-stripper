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
    "reader",
    "viz_id",
    "pubreferrer",
    "swu"
  ],

  // Marketo
  "mkt_": [
    "tok"
  ],

  // Simple Reach
  "sr_": [
    "share"
  ],

  // Vero
  "vero_": [
    "conv",
    "id"
  ],

  // Unknown
  "nr_": [
    "email_referer"
  ],

  // Unknown
  "nc": [
    "id"
  ],

  // Adobe Omniture SiteCatalyst
  "IC": [
    "ID"
  ],

  // Adobe Omniture SiteCatalyst
  "ic": [
    "id"
  ],

  // Hubspot
  "_hs": [
    "enc",
    "mi"
  ]
};
