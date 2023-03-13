import kubectl from "./kubectl.js";
import {
  K6_TEST_POD_REGEX,
  POLL_FREQUENCY
} from "../constants/constants.js";
import manifest from "./manifest.js";

const loadGenerators = {
  numTestsCompleted(stdout) {
    let testsCompleted = 0;
    const pods = stdout.split("\n");
    // console.log("Assessing load generators; counting the number completed");
    pods.forEach(pod => {
      if (pod.match(K6_TEST_POD_REGEX)) {
        if (pod.match('Completed')) {
          testsCompleted += 1;
        }
      }
    });
    // console.log(`Number of load generators completed: ${testsCompleted}`);
    return testsCompleted;
  },

  checkAllCompleted(totalTests) {
    return (
      kubectl.getPods()
        .then(({ stdout }) => {
          const currComplete = this.numTestsCompleted(stdout);
          if (currComplete === totalTests) {
            return true;
          }
        })
    );
  },

  pollUntilAllComplete(numVus) {
    const numLoadGenerators = manifest.parallelism(numVus);
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        // console.log("Polling load generators...");
        const finished = await this.checkAllCompleted(numLoadGenerators);
        if (!finished) {
          return;
        }

        clearInterval(interval);
        resolve();
      }, POLL_FREQUENCY);
    });
  }
};

export default loadGenerators;