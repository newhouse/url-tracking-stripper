/* global describe it */
'use strict';

const chai = require('chai');
chai.should();
// const expect = require('expect.js');

const examples = require('../examples');

const {
  REDIRECT_DATA_BY_TARGET_PARAM
} = require('../assets/js/redirects');

const {
  patternToRegExp,
  findRedirect
} = require('./helpers');

describe('Test regexes', () => {
  // console.log(REDIRECT_DATA_BY_TARGET_PARAM);


  I WAS HERE.
  WRAP UP AND MOVE THE FUNCTIONS THAT FIND REDIRECTS AND
  TRACKING PARAMS AND PUT THEM SOMEWHERE THAT TESTS CAN GET
  AT.

  examples.forEach(({fromm, too}, i) => {
    console.log({i});
    it(`Should convert ${fromm} to ${too}`, () => {
      const maybe = findRedirect(fromm);
      if(i===1) maybe.should.equal(too);
      return Promise.resolve();
    });
  });


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

});