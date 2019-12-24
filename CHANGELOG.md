- 5.0.0:
    + Private whitelisting and blacklisting.
- 4.2.3:
    + Added `YouTube` to known redirect handlers.
- 4.2.2:
    + Facebook `fclid`.
    + Added trackers for `comScore Digital Analytix`.
- 4.2.1:
    + Added tracker for `Commission Factory`.
- 4.2.0:
    + Added another Context Menu for "Clean and Open in New Tab" option.
    + Added ability to disable Context Menus
- 4.1.5:
    + Added another redirect for `ValueClick` and one for `Impact Radius`.
    + Updated regex replacement pattern for `PATH` [here](https://github.com/newhouse/url-tracking-stripper/pull/46/files).
- 4.1.4:
    + Changed `QS_KVS` regex to handle more scenarios.
- 4.1.3:
    + Added `Tradedoubler` to known redirect handlers.
    + Changed `QS_KVS` regex to handle empty key or values on either side of `=` in query params.
- 4.1.2:
    + Added `Reddit` to known redirect handlers.
- 4.1.1:
    + Added Alibaba's `spm` tracker.
    + Added Developer and Testing instructions to README.
- 4.1.0:
    + Added Context Menu item that will copy, skip, and strip link URLs.
- 4.0.9:
    + Using Webpack to build extension now.
- 4.0.8:
    + Added `Facebook` to known redirect handlers. Thanks @menzow!
- 4.0.7:
    + Updated tracking regex to matching trailing delimitters 0 or unlimited times (from 1 or unlimited).
- 4.0.6:
    + Added support for MailChimp trackers.
    + Added linting and removed lint.
- 4.0.5:
    + Improved `findQueryParam` to split query string on first occurrance of `'?'` character.
- 4.0.4:
    + Added `Gmail Link Wrappers` to known redirect handlers.
- 4.0.3:
    + Added `gclid=` to trackers.js
- 4.0.2:
    + Added `ref=` to trackers.js
- 4.0.1:
    + Disabled the "welcome" popup. It was probably turning off users.
    + On Install/Update will only remove "Skip Known Redirects" boolean from storage.
    + Default Stripping Method will only be applied if the User has nothing saved or they were using a deprecated method.
- 4.0.0:
    + Removed "Cancel & Reload" Stripping Method as it was useless.
    + Made "Skip Known Redirects" its own Stripping Method.
    + Added a few more known redirects.
    + Improved details about redirect skipping and tracking removal in the popup/info window.
    + Various UI/UX improvements thanks to [Pablo Massa](http://pablomassa.com/)
        * Welcome page font size, width and centering.
        * Options page using Radio Buttons instead of drop-down.
- 1.5:
    + Added support for "Skip Known Redirects".
    + Added "install"/"update" welcome html tab-opening.
    + Coding style updates:
        * 2-space indentations (vs 4)
        * `camelCase` instead of `snake_case`
        * `const` and `let` instead of `var`
        * `common.js` and `consts.js` shared files