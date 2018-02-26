/* eslint-disable no-unused-vars */

const {
  TRACKERS_BY_ROOT
} = require('./assets/js/trackers');


const {
  REDIRECT_EXAMPLES_BY_TARGET_PARAM
} = require('./test/helpers');


const hostEtc = 'https://foo.com/path/to/whatever';

// SPECIFIC TRACKER EXAMPLES WE WANT TO ADD IN
const trackerExamples = [
  {
    fromm: 'https://stripe.com/blog/ending-bitcoin-support?utm_source=newsletter&utm_medium=email&utm_campaign=&stream=top-stories',
    too: 'https://stripe.com/blog/ending-bitcoin-support?stream=top-stories'
  }
];

// STORE REDIRECT EXAMPLES
const redirectExamples = [
];

// STORE REDIRECT WITH TRACKERS EXAMPLES
const redirectWithTrackerExamples = [
];


// ALL THE ACTUAL TRACKER PARAMS WE'VE PROCESSED SO FAR
const allTrackersSoFar = [];


// ADD IN ALL THE COMBINATIONS OF TRACKERS:
for (let root in TRACKERS_BY_ROOT) {

  TRACKERS_BY_ROOT[root].forEach(suffix => {

    // CREATE THIS TRACKER
    const thisTracker = `${root}${suffix}=foo`;

    // ADD IT TO ALL THE ONES WE'VE DONE SO FAR
    allTrackersSoFar.push(thisTracker);

    // COMBINE ALL THE ONES WE'VE DONE SO FAR
    const allTrackersSoFarCombined = allTrackersSoFar.join('&');

    // ADD THIS TRACKER ALONE
    trackerExamples.push(
      {
        fromm: `${hostEtc}?${thisTracker}`,
        too: `${hostEtc}`
      }
    );

    // ADD THIS TRACKER AT THE BEGINNING
    trackerExamples.push(
      {
        fromm: `${hostEtc}?${thisTracker}&foo=bar`,
        too: `${hostEtc}?foo=bar`
      }
    );

    // ADD THIS TRACKER AT THE END
    trackerExamples.push(
      {
        fromm: `${hostEtc}?foo=bar&${thisTracker}`,
        too: `${hostEtc}?foo=bar`
      }
    );

    // CREATE A SUPER MEGA TRACKER URL CONTAINING ALL THE TRACKERS THUS FAR
    trackerExamples.push(
      {
        fromm: `${hostEtc}?${allTrackersSoFarCombined}`,
        too: `${hostEtc}`
      }
    );

    // CREATE A SUPER MEGA TRACKER URL CONTAINING ALL THE TRACKERS THUS FAR
    // WITH AN EXTRA ONE AT THE END
    trackerExamples.push(
      {
        fromm: `${hostEtc}?${allTrackersSoFarCombined}&foo=bar`,
        too: `${hostEtc}?foo=bar`
      }
    );

    // CREATE A SUPER MEGA TRACKER URL CONTAINING ALL THE TRACKERS THUS FAR
    // WITH AN EXTRA ONE AT THE BEGINNING
    trackerExamples.push(
      {
        fromm: `${hostEtc}?foo=bar&${allTrackersSoFarCombined}`,
        too: `${hostEtc}?foo=bar`
      }
    );
  });
}


// ADD IN ALL THE COMBINATIONS OF REDIRECTS:
for (let targetParam in REDIRECT_EXAMPLES_BY_TARGET_PARAM) {
  REDIRECT_EXAMPLES_BY_TARGET_PARAM[targetParam].forEach(root => {

    // CAN'T HANDLE NON-URI-ENCODED RIGHT NOW
    // ADD A BASIC REDIRECT EXAMPLE THAT IS NOT PROPERLY ENCODED
    // redirectExamples.push(
    //   {
    //     fromm: `${root}${targetParam}=${hostEtc}`,
    //     too: hostEtc
    //   }
    // );

    // ADD A BASIC REDIRECT EXAMPLE THAT IS PROPERLY ENCODED
    redirectExamples.push(
      {
        fromm: `${root}${targetParam}=${encodeURIComponent(hostEtc)}`,
        too: hostEtc
      }
    );


    // GO THROUGH EACH TRACKER EXAMPLE
    trackerExamples.forEach(({fromm, too}) => {

      // CAN'T HANDLE NON-URI-ENCODED RIGHT NOW
      // ADD A REDIRECT THAT HAS TRACKERS EXAMPLE THAT IS NOT PROPERLY ENCODED
      // redirectWithTrackerExamples.push(
      //   {
      //     fromm: `${root}${targetParam}=${fromm}`,
      //     too: too
      //   }
      // );

      // ADD A REDIRECT THAT HAS TRACKERS EXAMPLE THAT IS PROPERLY ENCODED
      redirectWithTrackerExamples.push(
        {
          fromm: `${root}${targetParam}=${encodeURIComponent(fromm)}`,
          too: too
        }
      );
    });


  });
}


module.exports = {
  trackerExamples,
  redirectExamples,
  redirectWithTrackerExamples
};