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