var options_saved_timeout = 3000;

function save_options() {
	var stripping_method = document.getElementById('stripping_method').value;

	chrome.storage.sync.set({
		stripping_method: stripping_method
		}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved!';
		setTimeout(function() {
			status.textContent = '';
		}, options_saved_timeout);
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	chrome.storage.sync.get({
		stripping_method: "1"
		}, function(items) {
			document.getElementById('stripping_method').value = items.stripping_method;
		});
}

document.addEventListener('DOMContentLoaded', function() {
	restore_options();
	var manifest = chrome.runtime.getManifest();
	document.getElementById('title').textContent = manifest.short_name;
});

document.getElementById('save').addEventListener('click', save_options);