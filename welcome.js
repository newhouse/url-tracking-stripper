// Once the page content is loaded:
document.addEventListener('DOMContentLoaded', function() {
    // Set the title
    var manifest = chrome.runtime.getManifest();

    const reason = findQueryParam('reason');
    console.log(reason);


    document.getElementById('image').src = chrome.runtime.getURL(manifest.icons[48]);

    let headline = '';
    if (reason === 'install') {
        headline += `Thanks for installing ${manifest.short_name}!`;
    }
    else if (reason === 'update') {
        headline += `${manifest.short_name} has been updated to version ${manifest.version}!`;
    }
    document.getElementById('headline').textContent = headline;


    document.getElementById('options_link').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    document.getElementById('documentation_link').href = manifest.homepage_url + '#readme';

});