/**********************
	API:

		https://developer.chrome.com/extensions/storage#property-sync
		Requires permission: storage

		https://developer.chrome.com/extensions/runtime#method-sendMessage
		Requires permission: n/a

***********************/


function log(msg) {
	console.log(msg);
}

var options_saved_timeout = 2000;

// Called to save the selected options
function save_options() {

	var stripping_method = document.getElementById('stripping_method').value;

	chrome.storage.sync.set({
		'STRIPPING_METHOD_TO_USE': parseInt(stripping_method)
		}, function() {
			// Update status to let user know options were saved.
			var status = document.getElementById('status');
			status.textContent = 'Options saved!';
			setTimeout(function() {
				status.textContent = '';
			}, options_saved_timeout);
		}
	);

	chrome.runtime.sendMessage({
			action: 'options_saved',
			options: {
				stripping_method: stripping_method
			}
		}
	);

}

// Dynamically generate the options page elements
function generate_elements() {
	chrome.runtime.getBackgroundPage(function(bp) {
		var option;
		var select = document.getElementById('stripping_method');
		for(stripping_method_id in bp.STRIPPING_METHOD_DESCRIPTIONS_BY_ID) {
			option = document.createElement('option');
			option.value = stripping_method_id;
			option.innerHTML = bp.STRIPPING_METHOD_DESCRIPTIONS_BY_ID[stripping_method_id];
			select.appendChild(option);
		}
		restore_options();
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	chrome.storage.sync.get({
		'STRIPPING_METHOD_TO_USE': "1"
		}, function(items) {
			document.getElementById('stripping_method').value = items['STRIPPING_METHOD_TO_USE'];
		}
	);
}

// Once the page content is loaded:
document.addEventListener('DOMContentLoaded', function() {
	// Set the title
	var manifest = chrome.runtime.getManifest();
	document.getElementById('title').textContent = manifest.short_name;

	// Generate the elements on the page
	generate_elements();

	// Monitor for save clicks
	document.getElementById('save').addEventListener('click', save_options);
});

