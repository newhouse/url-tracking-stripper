// Once the page skeleton is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Let's figure out the params that were passed.
    var queries = location.search.slice(1).split('&');
    var params = {};

    queries.forEach(function(q) {
        var kv = q.split('=');
        params[kv[0]] = decodeURIComponent(kv[1]);
    })

    // Populate some areas with stuff passed in the URL
    document.getElementById('title').textContent = params.title;
    document.getElementById('original').textContent = params.originalUrl;


	document.getElementById('go_to_original').addEventListener('click', function() {
		// Send message to background script that the user would like to re-load this
		// url un-stripped
		chrome.runtime.sendMessage({
			action: 'reload_and_allow_params',
			url: params.originalUrl
		});
		// Close the window.
		window.close();
	});

});
