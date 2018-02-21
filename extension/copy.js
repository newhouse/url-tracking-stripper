

// window.addEventListener('contextmenu', e => {
//   console.log('context menu');
//   console.log({e});
// });

console.log('copy injectedddd');


[
  'copy',
  'copyLink',
  'copy_Link',
  'copyAddress',
  'copy_Address',
  'copyLinkAddress',
  'copy_Link_Address'
].forEach(eventName => {

  addListener(eventName);

  const lowerCasedEventName = eventName.toLowerCase();
  if (eventName !== lowerCasedEventName) {
    addListener(lowerCasedEventName);
  }
});

function addListener(eventName) {
  document.addEventListener(eventName, function(e){
    console.log({eventName, e});
  }, true);
}