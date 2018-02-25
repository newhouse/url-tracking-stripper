'use strict';

const { REASON_INSTALL, REASON_UPDATE } = require('./consts');
const { findQueryParam }                = require('./common');

// Once the page content is loaded:
document.addEventListener('DOMContentLoaded', function() {
  const manifest  = chrome.runtime.getManifest();
  const reason    = findQueryParam('reason');

  // Set the image URL to be the 48px icon
  document.getElementById('image').src = chrome.runtime.getURL(manifest.icons[48]);

  // Dynamically set the headline
  let headline = '';
  if (reason === REASON_INSTALL) {
    headline = `Thanks for installing ${manifest.short_name}!`;
  }
  else if (reason === REASON_UPDATE) {
    headline = `${manifest.short_name} has been updated to version ${manifest.version}!`;
  }
  document.getElementById('headline').textContent = headline;

  // Handle a click of the options page.
  document.getElementById('options_link').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Set the href for the documentation link
  document.getElementById('documentation_link').href = manifest.homepage_url + '#readme';

});