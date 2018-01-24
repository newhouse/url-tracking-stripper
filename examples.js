/* eslint-disable no-unused-vars */

// Examples of Trackers being stripped
const TRACKER_EXAMPLES = [
  {
    from: 'https://stripe.com/blog/ending-bitcoin-support?utm_source=newsletter&utm_medium=email&utm_campaign=&stream=top-stories',
    to: 'https://stripe.com/blog/ending-bitcoin-support?stream=top-stories'
  }
];

// Examples of Redirects being detected
const REDIRECT_EXAMPLES = [
  {
    from: 'https://www.google.com/url?hl=en&q=http://link.axios.com/click/12012086.55449/aHR0cHM6Ly9zdHJpcGUuY29tL2Jsb2cvZW5kaW5nLWJpdGNvaW4tc3VwcG9ydD91dG1fc291cmNlPW5ld3NsZXR0ZXImdXRtX21lZGl1bT1lbWFpbCZ1dG1fY2FtcGFpZ249JnN0cmVhbT10b3Atc3Rvcmllcw/5841ec863f92a47b9bbaa831B5af114b6&source=gmail&ust=1516898557960000&usg=AFQjCNEo2dMEukeQwiPl8-f2sS3MgyByRw',
    to: 'http://link.axios.com/click/12012086.55449/aHR0cHM6Ly9zdHJpcGUuY29tL2Jsb2cvZW5kaW5nLWJpdGNvaW4tc3VwcG9ydD91dG1fc291cmNlPW5ld3NsZXR0ZXImdXRtX21lZGl1bT1lbWFpbCZ1dG1fY2FtcGFpZ249JnN0cmVhbT10b3Atc3Rvcmllcw/5841ec863f92a47b9bbaa831B5af114b6'
  }
];