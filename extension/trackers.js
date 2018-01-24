// More detailed string pattern suffixes, stored by their common root.
// eslint-disable-next-line no-unused-vars
const TRACKERS_BY_ROOT = {

  // Google's Urchin Tracking Module
  "utm_": [
    "source",
    "medium",
    "term",
    "campaign",
    "content",
    "name",
    "cid",
    "reader",
    "viz_id",
    "pubreferrer",
    "swu"
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
  ],

  // Marketo
  "mkt_": [
    "tok"
  ],

  // MailChimp
  // https://developer.mailchimp.com/documentation/mailchimp/guides/getting-started-with-ecommerce/
  "mc_": [
    "cid",
    "eid"
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

  // Non-prefixy and 1-offs
  "": [
    // Unknown
    "ncid",
    // Unknown
    "nr_email_referer",
    // Generic-ish. Facebook, Product Hunt and others
    "ref",
    // Google Click Identifier
    "gclid"
  ]
};