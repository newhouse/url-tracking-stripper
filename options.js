'use strict';

const OPTIONS_SAVED_TIMEOUT = 2000;
let   OPTIONS_SAVED_TIMER;

// Called to save the selected options
function saveOptions() {

  const options = {
    [STORAGE_KEY_STRIPPING_METHOD_TO_USE]:  getSelectedStrippingMethod()
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
  return parseInt(document.querySelector('input[name="stripping_method"]:checked').value)
}

function generateRadioId(id) {
  return `radio_${id}`;
}

// Dynamically generate the options page elements
function generateOptionElements() {

  // Get the Background page
  chrome.runtime.getBackgroundPage(function(bp) {
    const radios = document.getElementById('stripping_method');

    for (let strippingMethodId in bp.STUFF_BY_STRIPPING_METHOD_ID) {

      const id          = generateRadioId(strippingMethodId);

      const radio       = document.createElement('input');
      radio.type        = 'radio';
      radio.id          = id;
      radio.name        = 'stripping_method';
      radio.value       = strippingMethodId;
      radios.appendChild(radio);

      const label       = document.createElement('label');
      label.for         = id;
      label.innerHTML   = bp.STUFF_BY_STRIPPING_METHOD_ID[strippingMethodId].html;
      radios.appendChild(label);

      const br          = document.createElement('br');
      radios.appendChild(br);
    }

    // Set the appropriate option(s) to be selected
    restoreOptions();
  });
}


// Restores radio button and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  return getOptionsFromStorage(items => {

    // Set the appropriate radio button to be selected.
    document.getElementById(generateRadioId(items[STORAGE_KEY_STRIPPING_METHOD_TO_USE])).checked = true;
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

  // Monitor for choice changes as well, even though it's redundant
  document.getElementById('stripping_method').addEventListener('change', saveOptions);
});
