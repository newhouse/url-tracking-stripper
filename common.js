function findQueryParam(targetParam, url) {
    url = url || window.location.href;

    if (!(targetParam && url)) {
        return false;
    }

    // Split the URL at the '?' to get the query string
    const query_string = url.split('?')[1];

    // If we have a query string...
    if (query_string) {

        // Get the key/value pairs from the query string
        const key_vals = query_string.split('&');
        // Figure out how many pairs we have
        const kvs_length = key_vals.length;
        // For each iteration fo the loop
        let kv;

        for(let i=0; i < kvs_length; i++) {
            // Get this key/value pair and split it up into its pieces
            kv = key_vals[i].split('=');
            // We are looking for "url=blahblahblah", so see if this is the one
            if (kv[0] === targetParam) {
                return kv[1];
            }
        }
    }
}