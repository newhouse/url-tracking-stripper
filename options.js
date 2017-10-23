var options_saved_timeout = 2000;

// Called to save the selected options
function save_options() {

    adjust_checkbox();

    const stripping_method_value = parseInt(document.getElementById('stripping_method').value);
    const skip_google = document.getElementById('skipgoogle').checked;

    const options = {
        'STRIPPING_METHOD_TO_USE': stripping_method_value,
        'SKIP_GOOGLE_REDIRECTS': skip_google
    };

    console.log('options:', options);

    chrome.storage.sync.set(
        options,
        function() {
            // Update status to let user know options were saved.
            let status = document.getElementById('status');
            // status.textContent = 'Options saved!';
            status.style.opacity = 1;
            setTimeout(function() {
                // status.textContent = '';
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
    const stripping_method = document.getElementById('stripping_method');
    const skip_google = document.getElementById('skipgoogle');
    const skip_google_wrapper = document.getElementById('skipgoogle_wrapper');

    console.log('stripping_method.value', parseInt(stripping_method.value));

    if (parseInt(stripping_method.value) === 1) {
        skip_google.checked = false;
        skip_google.disabled = true;
        skip_google_wrapper.style.display = "none";
    }
    else {
        skip_google.disabled = false;
        skip_google_wrapper.style.display = "block";
    }
}

// Dynamically generate the options page elements
function generate_option_elements() {
    chrome.runtime.getBackgroundPage(function(bp) {
        var option;
        var select = document.getElementById('stripping_method');
        for(stripping_method_id in bp.STUFF_BY_STRIPPING_METHOD_ID) {
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
        'STRIPPING_METHOD_TO_USE': "1",
        'SKIP_GOOGLE_REDIRECTS': false
        },
        function(items) {
            document.getElementById('stripping_method').value = items['STRIPPING_METHOD_TO_USE'];
            document.getElementById('skipgoogle').checked = items['SKIP_GOOGLE_REDIRECTS'];

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
    document.getElementById('skipgoogle').addEventListener('change', save_options);
});
