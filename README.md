# URL Tracking Stripper

A Chrome Extension designed with one intention: remove the tracking parameters from URLs to keep them short and cleaner for sharing, bookmarking, etc.

You can install this Extension in the [Chrome Webstore][store]

[![Chrome Webstore](webstore_badge.png)][store]


####The following URL parameters are removed:
Google's Urchin Tracking Module
- `utm_source`
- `utm_medium`
- `utm_term`
- `utm_campaign`
- `utm_content`
- `utm_cid`
- `utm_reader`
- `utm_viz_id`
- `utm_pubreferrer`
- `utm_swu`

Adobe Omniture SiteCatalyst
- `ICID`
- `icid`

Hubspot
- `_hsenc`
- `_hsmi`

Marketo
- `mkt_tok`

Simple Reach
- `sr_share`

Vero
- `vero_conv`
- `vero_id`

Unknown
- `nr_email_referer`
- `ncid`

Please file an Issue if you would like others tracked!

# Stripping Methods
This Extension is free and open source, and in no way is trying to keep tabs on you. However,
different options provide different pros and cons around things like
permissions, speed and privacy. Please read about the different "Stripping Methods" avaiable
and choose which one is right for you:

1) __History Change__: This approach will simply monitor for URLs that you visit which contain tracking parameters, and
__*after the page loads*__ it will update your browser History and remove the tracking parameters from the URL for that tab.
This is pretty slick, shouldn't slow your browsing down and requires no page re-load. However, it provides absolutely
__*no increased privacy*__ for you, as any sites have already registered and tracked your visit by the time the change is
made to the URL. You can think of it as a purely cosmetic fix.

2) __Cancel and Re-Load__: This approach will attempt to cancel any Web Requests made by tabs that are found to contain
tracking parameters, and try to instead re-load the equivalent URL without the tracking parameters. While this should not
slow your general browsing since requests begin immediately *before* they are checked for containing a tracking parameter,
this approach may slow down your experience slightly on URLs that contained tracking parameters. This is because some
amount of resources will have been loaded already by the time the overall page request is cancelled, adjusted and then
re-loaded with a clean URL. Furthermore, while this approach is likely to result in increased privacy when it is able to
removing tracking parameters before they are able to be processed, it's possible that the time between the original request
and the cancellation was enough to be tracked, so __*increased privacy is not guaranteed*__.

3) __Block and Re-Load__: This approach will evaluate any URLs you attempt to visit __*before*__ the request is actually executed.
Any URLs that appear to contain tracking will be blocked and then the equivalent URL without the tracking parameters will
be re-loaded instead.  While every effort to make the impact of this implementation minimal/unnoticeable has been made, and
Chrome has spent a lot of time optimizing this area as well, this will still add a small amount of overhead to your
web page requests. However, of the available methods, this one adds the most privacy due to the fact that tracking paramters
are stripped from URLs before they are requested.

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
- v1.3 - Added Hubspot trackers.
- v1.2 - Made the Page Action popup better looking with MDL.
- v1.1 - added more trackers to the list. Changed some image and description, etc.
- v1.0 - added ability to re-load a page with trackers allowed 1-time from the PageAction (icon)
- v0.0.7-8 - Added more trackers.
- v0.0.6 - Icon will become active when a URL has some pieces stripped by the extension so you know when it's done something. The original URL will be shown if you click on it.
- v.0.0.5 - Added support for more trackers. Made faster. Fixed bugs around removing matches that are *not* parameters, etc.

[store]: https://chrome.google.com/webstore/detail/url-tracking-stripper/flnagcobkfofedknnnmofijmmkbgfamf
