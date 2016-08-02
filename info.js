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

});
