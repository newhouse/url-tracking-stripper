const OPTIONS_SAVED_TIMEOUT = 2000;
let OPTIONS_SAVED_TIMER;


// Called to save the selected options
function saveOptions() {

  adjustCheckbox();

  const strippingMethodValue  = parseInt(document.getElementById('stripping_method').value);
  const skipKnownRedirects    = document.getElementById('skip_redirects').checked;

  const options = {
    [STORAGE_KEY_STRIPPING_METHOD_TO_USE]:  strippingMethodValue,
    [STORAGE_KEY_SKIP_KNOWN_REDIRECTS]:     skipKnownRedirects
  };

  chrome.storage.sync.set(
    options,
    function() {
      // CLEAR ANY OTHER TIMEOUT THAT MAY HAVE BEEN RUNNING
      clearTimeout(OPTIONS_SAVED_TIMER);

      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.style.opacity = 1;

      // SAVE THE TIMER SO THAT IT CAN BE CANCELLED
      OPTIONS_SAVED_TIMER = setTimeout(function() { status.style.opacity = 0; }, OPTIONS_SAVED_TIMEOUT);
    }
  );

  // Send the new options values to the background script so it can handle
  // accordingly
  chrome.runtime.sendMessage(
    {
      action:   ACTION_OPTIONS_SAVED,
      options:  options
    }
  );
}

function adjustCheckbox() {
  const stripping_method          = document.getElementById('stripping_method');
  const skipKnownRedirects        = document.getElementById('skip_redirects');
  const skipKnownRedirectsWrapper = document.getElementById('skip_redirects_wrapper');

  // If the Stripping Method is History Change, then there is nothing we can
  // do to help with skipping redirects, so disable and remove this option
  if (parseInt(stripping_method.value) === STRIPPING_METHOD_HISTORY_CHANGE) {
    skipKnownRedirects.checked              = false;
    skipKnownRedirects.disabled             = true;
    skipKnownRedirectsWrapper.style.display = "none";
  }
  else {
    skipKnownRedirects.disabled             = false;
    skipKnownRedirectsWrapper.style.display = "block";
  }
}

// Dynamically generate the options page elements
function generateOptionElements() {
  chrome.runtime.getBackgroundPage(function(bp) {
    const select = document.getElementById('stripping_method');

    for (let strippingMethodId in bp.STUFF_BY_STRIPPING_METHOD_ID) {

      let option        = document.createElement('option');
      option.value      = strippingMethodId;
      option.innerHTML  = bp.STUFF_BY_STRIPPING_METHOD_ID[strippingMethodId].html;

      select.appendChild(option);
    }

    // Set the appropriate option(s) to be selected
    restoreOptions();
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  return getOptionsFromStorage(items => {
    document.getElementById('stripping_method').value = items[STORAGE_KEY_STRIPPING_METHOD_TO_USE];
    document.getElementById('skip_redirects').checked = items[STORAGE_KEY_SKIP_KNOWN_REDIRECTS];

    adjustCheckbox();
  });
}

// Once the page content is loaded:
document.addEventListener('DOMContentLoaded', function() {
  // Get the Manifest
  const manifest = chrome.runtime.getManifest();

  // Set the title
  document.getElementById('title').textContent = manifest.short_name;

  // Generate the elements on the page
  generateOptionElements();

  // Monitor for save clicks
  document.getElementById('save').addEventListener('click', saveOptions);

  // Monitor for choice changes as well, even though it's redundant
  document.getElementById('stripping_method').addEventListener('change', saveOptions);
  document.getElementById('skip_redirects').addEventListener('change', saveOptions);

  // Set the homepage URL
  document.getElementById('homepage_url').href = manifest.homepage_url + '#readme';
});
