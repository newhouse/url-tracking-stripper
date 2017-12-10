// Once the page skeleton is loaded
document.addEventListener('DOMContentLoaded', function() {

  // Let's figure out the params that were passed.
  const queries = location.search.slice(1).split('&');
  const params  = {};

  // Decode all params and store them.
  queries.forEach(q => {
    const kv = q.split('=');
    params[kv[0]] = decodeURIComponent(kv[1]);
  })

  // JSON Parse the changes array
  if (params.changes) {
    try {
      params.changes = JSON.parse(params.changes);
    }
    catch (e) {
      params.changes = [];
    }
  }

  // Populate the title
  document.getElementById('title').textContent = params.title;

  // Store how many changes are in the array
  const numChanges = params.changes.length;

  // Go through each of the changes and do some work.
  params.changes.forEach((change, i) => {
    const {
      originalUrl,
      cleansedUrl,
      type
    } = change;

    // Description Type starts out as the type
    let descriptionType = `${type}:`;

    // If this is the first change item
    if (i === 0) {
      // If there is only 1 change item
      if (numChanges === 1) {
        // Set the bigger, bolder notification
        document.getElementById('notification').textContent = type + '!';
        // Make the Description Type be nothing. Too much info.
        descriptionType = '';
      }

      // Set the scissor URL because it's cool
      const scissorText = document.createElement('span');
      scissorText.className = 'scroller';
      scissorText.innerText = originalUrl;

      document.getElementById('scissor_url_div').appendChild(scissorText);
    }

    const block = document.createElement('div');
    block.className = "mdl-card__actions mdl-card--border";

    // If there's more than 1 change, then let's label this a bit
    if (numChanges > 1) {
      // Create a description div and populate it with some info then add it
      // to the DOM
      const description = document.createElement('span');
      const numString = `${i + 1}) `;
      description.innerText = `${numString}${descriptionType}`
      block.appendChild(description);

      // Add a break
      const br = document.createElement('br');
      block.appendChild(br);
    }

    // Make an element for the Orignal URL to be displayed
    const original = document.createElement('span');
    // Add the scroller class to it so it scrolls all cool like.
    original.className = "scroller";
    original.innerText = originalUrl;
    block.appendChild(original);

    // Create a button to allow the User to reload the page without processing it next time
    const button = document.createElement('button');
    button.className = "mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent";
    button.innerText = "Reload with full URL";
    // When someone clicks that link, reload the page with the URL un-processed
    button.addEventListener('click', () => {
      // Send me on my way
      chrome.runtime.sendMessage({
        action:  ACTION_RELOAD_AND_ALLOW_PARAMS,
        url:     originalUrl
      });

      // Close the window.
      window.close();
    });

    // Add this to the block
    block.appendChild(button);

    // Add the block to the buttons area so it's displayed
    document.getElementById('buttons').appendChild(block);
  });
});
