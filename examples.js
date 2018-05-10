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
  },
  {
    fromm: 'https://activity.alibaba.com/sale/march-expo/beauty-personal-care.html?spm=a2700.8293689.procates.6.46ce65aaHNdagx&tracelog=20180305_ICBU_HOME_CATEGORY_PROMOTION_26103',
    too: 'https://activity.alibaba.com/sale/march-expo/beauty-personal-care.html?tracelog=20180305_ICBU_HOME_CATEGORY_PROMOTION_26103'
  }
];

// STORE REDIRECT EXAMPLES
const redirectExamples = [
  {
    fromm: 'https://out.reddit.com/t3_7jwyol?url=https%3A%2F%2Fexample.com%2Fexamplepath&token=some-UUID-like-token&app_name=reddit.com',
    too: 'https://example.com/examplepath'
  },
  {
    fromm: 'https://out.reddit.com/t3_8an64b?url=https%3A%2F%2Fexample.com%2Fanotherexamplepath&token=some-different-UUID-like-token&app_name=reddit.com',
    too: 'https://example.com/anotherexamplepath',
  },
  {
    fromm: 'http://clkde.tradedoubler.com/click?=&p=259740&a=2821835&g=0&url=https%3a%2f%2fwww.microsoft.com%2fen-us%2fstore%2fp%2fthe-witness%2fbx1wpt5rjsb2',
    too: 'https://www.microsoft.com/en-us/store/p/the-witness/bx1wpt5rjsb2'
  },
  {
    fromm: 'https://www.ojrq.net/p/?return=http%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3Dhi&cid=2092&tpsync=yes',
    too: 'http://www.google.com/search?q=hi'
  }
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