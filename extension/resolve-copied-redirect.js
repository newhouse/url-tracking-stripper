/* global

  chrome
*/
'use strict';

let getLinkElement = el => {
  do {
    if(el.href && el.href.startsWith('http')) {
      return el;
    }
    el = el.parentNode;
  } while(el !== null);
};

window.addEventListener('contextmenu', e => {
  let target = getLinkElement(e.target);
  if(target)
    chrome.runtime.sendMessage(
      {action: 'apply_redirects', url: target.href},
      url => {target.href = url;}
    );
});
