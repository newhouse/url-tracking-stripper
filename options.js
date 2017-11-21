var options_saved_timeout = 2000;
let options_saved_timer;


// Called to save the selected options
function save_options() {

  adjust_checkbox();

  const stripping_method_value  = parseInt(document.getElementById('stripping_method').value);
  const skip_known_redirects    = document.getElementById('skip_redirects').checked;

  const options = {
    [STORAGE_KEY_STRIPPING_METHOD_TO_USE]:  stripping_method_value,
    [STORAGE_KEY_SKIP_KNOWN_REDIRECTS]:   skip_known_redirects
  };

  chrome.storage.sync.set(
    options,
    function() {
      // CLEAR ANY OTHER TIMEOUT THAT MAY HAVE BEEN RUNNING
      clearTimeout(options_saved_timer);

      // Update status to let user know options were saved.
      let status = document.getElementById('status');
      status.style.opacity = 1;

      // SAVE THE TIMER SO THAT IT CAN BE CANCELLED
      options_saved_timer = setTimeout(function() {
        status.style.opacity = 0;
      }, options_saved_timeout);
    }
  );

  // Send the new options values to the background script so it can handle
  // accordingly
  chrome.runtime.sendMessage(
    {
      action: 'options_saved',
      options: options
    }
  );
}

function adjust_checkbox() {
  const stripping_method        = document.getElementById('stripping_method');
  const skip_known_redirects      = document.getElementById('skip_redirects');
  const skip_known_redirects_wrapper  = document.getElementById('skip_redirects_wrapper');

  // If the Stripping Method is History Change, then there is nothing we can
  // do to help with skipping redirects, so disable and remove this option
  if (parseInt(stripping_method.value) === 1) {
    skip_known_redirects.checked = false;
    skip_known_redirects.disabled = true;
    skip_known_redirects_wrapper.style.display = "none";
  }
  else {
    skip_known_redirects.disabled = false;
    skip_known_redirects_wrapper.style.display = "block";
  }
}

// Dynamically generate the options page elements
function generate_option_elements() {
  chrome.runtime.getBackgroundPage(function(bp) {
    var option;
    var select = document.getElementById('stripping_method');

    for (stripping_method_id in bp.STUFF_BY_STRIPPING_METHOD_ID) {
      option = document.createElement('option');
      option.value = stripping_method_id;
      option.innerHTML = bp.STUFF_BY_STRIPPING_METHOD_ID[stripping_method_id].html;
      select.appendChild(option);
    }

    // Set the appropriate option(s) to be selected
    restore_options();
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    [STORAGE_KEY_STRIPPING_METHOD_TO_USE]: STRIPPING_METHOD_HISTORY_CHANGE,
    [STORAGE_KEY_SKIP_KNOWN_REDIRECTS]:  false
    },
    function(items) {
      document.getElementById('stripping_method').value = items[STORAGE_KEY_STRIPPING_METHOD_TO_USE];
      document.getElementById('skip_redirects').checked = items[STORAGE_KEY_SKIP_KNOWN_REDIRECTS];

      adjust_checkbox();
    }
  );
}

// Once the page content is loaded:
document.addEventListener('DOMContentLoaded', function() {
  // Set the title
  var manifest = chrome.runtime.getManifest();
  document.getElementById('title').textContent = manifest.short_name;

  // Generate the elements on the page
  generate_option_elements();

  // Monitor for save clicks
  document.getElementById('save').addEventListener('click', save_options);
  // Monitor for choice changes as well, even though it's redundant
  document.getElementById('stripping_method').addEventListener('change', save_options);
  document.getElementById('skip_redirects').addEventListener('change', save_options);

  document.getElementById('homage_url').href = manifest.homepage_url + '#readme';
});
