'use strict';

const { getOptionsFromStorage }               = require('./common');
const {
  STORAGE_KEY_STRIPPING_METHOD_TO_USE,
  CONTEXT_MENU_COPY_CLEAN_ID,
  CONTEXT_MENU_CLEAN_AND_GO_ID,
  ACTION_OPTIONS_SAVED,
  ACTION_GET_STUFF_BY_STRIPPING_METHOD_ID
}                                             = require('./consts');


const OPTIONS_SAVED_TIMEOUT = 3000;
let   OPTIONS_SAVED_TIMER;


// Called to save the selected options
function saveOptions() {

  const options = {
    [STORAGE_KEY_STRIPPING_METHOD_TO_USE]:  getSelectedStrippingMethod(),
    [CONTEXT_MENU_COPY_CLEAN_ID]: isChecked('#context_menu_copy_clean'),
    [CONTEXT_MENU_CLEAN_AND_GO_ID]: isChecked('#context_menu_clean_go')
  };

  // Send the new options values to the background script so it can handle accordingly
  chrome.runtime.sendMessage(
    {
      action:   ACTION_OPTIONS_SAVED,
      options:  options
    },
    // Do this when it's completed
    function() {
      // Clear any other timeout that may have been running
      clearTimeout(OPTIONS_SAVED_TIMER);

      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.style.opacity = 1;

      // SAVE THE TIMER SO THAT IT CAN BE CANCELLED
      OPTIONS_SAVED_TIMER = setTimeout(function() { status.style.opacity = 0; }, OPTIONS_SAVED_TIMEOUT);
    }
  );
}


function getSelectedStrippingMethod() {
  return parseInt(document.querySelector('input[name="stripping_method"]:checked').value);
}

function isChecked(selector) {
  return document.querySelector(selector).checked;
}

function generateRadioId(id) {
  return `radio_${id}`;
}

// Dynamically generate the options page elements
function generateOptionElements() {

  // Get the Background page
  chrome.runtime.sendMessage(
    // Message payload
    { action: ACTION_GET_STUFF_BY_STRIPPING_METHOD_ID },
    // Callback
    (STUFF_BY_STRIPPING_METHOD_ID) => {
      const radios = document.getElementById('stripping_method');

      for (let strippingMethodId in STUFF_BY_STRIPPING_METHOD_ID) {

        const id          = generateRadioId(strippingMethodId);

        const radio       = document.createElement('input');
        radio.type        = 'radio';
        radio.id          = id;
        radio.name        = 'stripping_method';
        radio.value       = strippingMethodId;
        radios.appendChild(radio);

        const label       = document.createElement('label');
        label.for         = id;
        label.innerHTML   = STUFF_BY_STRIPPING_METHOD_ID[strippingMethodId].html;
        radios.appendChild(label);

        const br          = document.createElement('br');
        radios.appendChild(br);
      }

      // Set the appropriate option(s) to be selected
      restoreOptions();
    }
  );
}


// Restores radio button state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  return getOptionsFromStorage(items => {
    // Set the appropriate radio button to be selected.
    document.getElementById(generateRadioId(items[STORAGE_KEY_STRIPPING_METHOD_TO_USE])).checked = true;
    // Set the value for the Context Menu checkboxes
    document.getElementById('context_menu_copy_clean').checked = items[CONTEXT_MENU_COPY_CLEAN_ID] === true;
    document.getElementById('context_menu_clean_go').checked = items[CONTEXT_MENU_CLEAN_AND_GO_ID] === true;
  });
}


// Once the page content is loaded:
document.addEventListener('DOMContentLoaded', function() {
  // Get the Manifest
  const manifest = chrome.runtime.getManifest();

  // Set the title
  document.getElementById('title').textContent = manifest.short_name;

  // Set the homepage URL
  document.getElementById('homepage_url').href = manifest.homepage_url + '#readme';

  // Generate the elements on the page
  generateOptionElements();

  // Listen to changes on them
  document.getElementById('stripping_method').addEventListener('change', saveOptions);
  document.getElementById('context_menu_copy_clean').addEventListener('change', saveOptions);
  document.getElementById('context_menu_clean_go').addEventListener('change', saveOptions);
});
