# URL Tracking Stripper

A Chrome Extension designed with one intention: Increase the speed and privacy of your web browsing by skipping tracking redirects and removing the tracking parameters from URLs to keep them short and cleaner for sharing, bookmarking, etc.

You can install this Extension in the [Chrome Webstore][store]

[![Chrome Webstore](webstore_badge.png)][store]


#### The following URL parameters are removed:
Google's Urchin Tracking Module & Google Adwords
- `utm_source`
- `utm_medium`
- `utm_term`
- `utm_campaign`
- `utm_content`
- `utm_name`
- `utm_cid`
- `utm_reader`
- `utm_viz_id`
- `utm_pubreferrer`
- `utm_swu`
- `gclid`

Adobe Omniture SiteCatalyst
- `ICID`
- `icid`

Hubspot
- `_hsenc`
- `_hsmi`

Marketo
- `mkt_tok`

MailChimp
- `mc_cid`
- `mc_eid`

Simple Reach
- `sr_share`

Vero
- `vero_conv`
- `vero_id`

Unknown
- `nr_email_referer`
- `ncid`
- `ref`

Please file an Issue if you would like others tracked!

You can find the file with the trackers [here](https://github.com/newhouse/url-tracking-stripper/blob/master/extension/trackers.js).

# Stripping Methods
This Extension is free and open source, and in no way is trying to keep tabs on you. However,
different options provide different pros and cons around things like
permissions, speed and privacy. Please read about the different "Stripping Methods" avaiable
and choose which one is right for you:

1) __History Change__:
   - This approach will simply monitor for URLs that you visit which contain tracking parameters, and __*after the page loads*__ it will update your browser History and remove the tracking parameters from the URL for that tab.
   - This is pretty slick, shouldn't slow your browsing down and requires no page re-load. However, it provides absolutely __*no increased privacy*__ for you, as any sites have already registered and tracked your visit by the time the change is made to the URL.
   - You can think of it as a purely cosmetic fix. I recommend one of the more privacy-focused Stripping Methods below, but it is your call.

2) __Block and Re-Load__:
   - This approach will evaluate any URLs you attempt to visit __*before*__ the request is actually executed. Any URLs that appear to contain tracking will be blocked and then the equivalent URL without the tracking parameters will be re-loaded instead.
   - While every effort to make the impact of this implementation minimal/unnoticeable has been made, and Chrome has spent a lot of time optimizing this area as well, this will still add a small amount of overhead to your web page requests.
   - Of the available methods, this one adds the more privacy over the "History Change" Stripping Method due to the fact that tracking paramters are stripped from URLs before they are requested.
   - For even more privacy, I recommend the below "Block and Re-load + Skip Redirects" option below.

3) __Block and Re-load + Skip Redirects__:
   - This approach is nearly identicle to the above "Block And Re-load" Stripping Method.
   - However this one adds the __*most privacy*__ due to the fact that this method [Skips Known Redirects](#skip-known-redirects) that may track you via an intermediate page load - see below for more info.


#### Skip Known Redirects
Some links on pages (e.g. Google Search Results) look like they take you directly to the target URL, but really they will pass you through (an) intermediate server(s), cookie/track you, and then finally redirect you to the target URL. Some Stripping Methods make it possible for this extension to recognize when these links are clicked, and then extract the target URL and take you straight there, skipping the redirect and unnecessary tracking. For this reason, I recommend choosing the "Block and Re-load + Skip Redirects" Stripping Method.

You can find the file with the known redirects [here](https://github.com/newhouse/url-tracking-stripper/blob/master/extension/redirects.js).

Additional thoughts: This extension was not intended to be a catch-all for removing tracking and increasing your privacy.
Its main purpose was simply to get a bunch of noise out of your address bar, with additional privacy (depending on your
Stripping Method) being an added benefit. This extension also __*only monitors the URLs for the "main page"*__ that you are
visiting in your tabs, and does not monitor any resources that are subesquently loaded by that page that may contain
tracking parameters. If you are really interested in privacy and actually blocking all tracking requests, I highly
recommended you take a look at something that was designed with that as its goal, such as Ghostery [https://www.ghostery.com/].


## Utilizes:
- Chrome Extensions Runtime [onMessage](https://developer.chrome.com/extensions/runtime#event-onMessage) (`chrome.runtime.onMessage`)
- Chrome Extensions Runtime [sendMessage](https://developer.chrome.com/extensions/runtime#method-sendMessage) (`chrome.runtime.sendMessage`)
- Chrome Extensions Runtime [getManifest](https://developer.chrome.com/extensions/runtime#method-getManifest) (`chrome.runtime.getManifest`)
- Chrome Extensions Runtime [getBackgroundPage](https://developer.chrome.com/extensions/runtime#method-getBackgroundPage) (`chrome.runtime.getBackgroundPage`)
- Chrome Extensions [Storage Sync](https://developer.chrome.com/extensions/storage) (`chrome.storage.sync`)
- Chrome Extensions Tabs [onUpdated](https://developer.chrome.com/extensions/tabs#event-onUpdated) (`chrome.tabs.onUpdated`)
- Chrome Extensions Tabs [update](https://developer.chrome.com/extensions/tabs#method-update) (`chrome.tabs.update`)
- Chrome Extensions Tabs [executeScript](https://developer.chrome.com/extensions/tabs#method-executeScript) (`chrome.tabs.executeScript`)
- Chrome Extensions [webRequest & webRequestBlocking](https://developer.chrome.com/extensions/webRequest) (`chrome.webRequest.onBeforeRequest`)
- Window History [pushState()](https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method)


# Version History
__Version history has been moved to the [CHANGELOG](https://github.com/newhouse/url-tracking-stripper/blob/master/CHANGELOG.md). Please look at that for changes.__
- v1.4 - Added tracker: `utm_name`.
- v1.3 - Added Hubspot trackers.
- v1.2 - Made the Page Action popup better looking with MDL.
- v1.1 - added more trackers to the list. Changed some image and description, etc.
- v1.0 - added ability to re-load a page with trackers allowed 1-time from the PageAction (icon)
- v0.0.7-8 - Added more trackers.
- v0.0.6 - Icon will become active when a URL has some pieces stripped by the extension so you know when it's done something. The original URL will be shown if you click on it.
- v.0.0.5 - Added support for more trackers. Made faster. Fixed bugs around removing matches that are *not* parameters, etc.

[store]: https://chrome.google.com/webstore/detail/url-tracking-stripper/flnagcobkfofedknnnmofijmmkbgfamf
