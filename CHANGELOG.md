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