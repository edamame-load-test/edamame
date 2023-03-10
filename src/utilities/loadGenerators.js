import child_process from "child_process";
import { promisify } from "util";
import kubectl from "./kubectl.js";
import { K6_TEST_POD_REGEX } from "./constants.js";
const exec = promisify(child_process.exec);

const loadGenerators = {
  numTestsCompleted(stdout) {
    let testsCompleted = 0;
    const pods = stdout.split("\n");
    console.log("iterating through k6 load gen pods and counting the number of completed");
    pods.forEach(pod => {
      if (pod.match(K6_TEST_POD_REGEX)) {
        if (pod.match('Completed')) {
          testsCompleted += 1;
        }
      }
    });
    console.log(`number of tests completed: ${testsCompleted}`);
    return testsCompleted;
  },

  checkAllCompleted(totalTests) {
    return (
      kubectl.getPods()
        .then(stdoObj => {
          const currComplete = this.numTestsCompleted(stdoObj.stdout);
          if (currComplete === totalTests) {
            return true;
          }
        })
    );
  },

  pollUntilAllComplete(numVus) {
    const numLoadGenerators = kubectl.parallelism(numVus);
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        console.log("Starting new poll async function iteration");
        const finished = await this.checkAllCompleted(numLoadGenerators);
        if (!finished) {
          return;
        }

        clearInterval(interval);
        resolve();
      }, 30000); // 30 seconds is arbitrary
    });
  }
};

export default loadGenerators;