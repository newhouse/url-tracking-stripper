/* global describe it */
'use strict';

const chai = require('chai');
// Extend the prorotype of everything
chai.should();

const {
  trackerExamples,
  redirectExamples,
  redirectWithTrackerExamples
} = require('../examples');

const {
  skipRedirectAndRemoveTrackers
} = require('./helpers');


function log() {
  if (false) {
    console.log(...arguments);
  }
}



describe('Test Removal of Trackers', () => {
  // Test each tracker example
  trackerExamples.forEach(({fromm, too}) => {
    const desc = `Should convert ${fromm} to ${too}`;

    it(desc, () => {
      log(desc);

      const result = skipRedirectAndRemoveTrackers(fromm);
      result.should.equal(too);

      return Promise.resolve();
    });
  });
});


describe('Test Skipping of Redirects', () => {
  // Test each redirect example
  redirectExamples.forEach(({fromm, too}) => {
    const desc = `Should convert ${fromm} to ${too}`;

    it(desc, () => {
      log(desc);

      const result = skipRedirectAndRemoveTrackers(fromm);
      result.should.equal(too);

      return Promise.resolve();
    });
  });
});


describe('Test Skipping of Redirects with Trackers to Remove', () => {
  // Test each redirect with a target (likely) containing trackers
  redirectWithTrackerExamples.forEach(({fromm, too}) => {
    const desc = `Should convert ${fromm} to ${too}`;

    it(desc, () => {
      log(desc);

      const result = skipRedirectAndRemoveTrackers(fromm);
      result.should.equal(too);

      return Promise.resolve();
    });
  });
});


// Some day, let's test pattern-to-regex translation.
// for (let targetParam in REDIRECT_DATA_BY_TARGET_PARAM) {
//   const {
//     patterns,
//     regexes
//   } = REDIRECT_DATA_BY_TARGET_PARAM[targetParam];

//   // console.log({patterns});

//   patterns.forEach((pattern, i) => {

//     console.log('pattern:', pattern);

//     const expectedRegex = regexes[i];
//     const actualRegex = patternToRegExp(pattern);

//     it('Should have made proper regex out of pattern', () => {
//       actualRegex.should.equal(expectedRegex);
//       return Promise.resolve();
//     });
//   });
// }