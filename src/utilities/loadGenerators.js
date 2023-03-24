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

    pods.forEach(pod => {
      if (pod.match(K6_TEST_POD_REGEX)) {
        if (pod.match('Completed')) {
          testsCompleted += 1;
        }
      }
    });

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

  pollUntilAllComplete(numNodes) {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {

        const finished = await this.checkAllCompleted(numNodes);
        if (!finished) {
          return;
        }

        clearInterval(interval);
        resolve();
      }, POLL_FREQUENCY);
    });
  },

  pollUntilGenNodesReady(numNodes) {
    return new Promise(resolve => {
      const interval = setInterval(async () => {
        const readyNodes = await kubectl.getGeneratorNodesReadyCount();
        if (readyNodes !== numNodes) return;

        clearInterval(interval);
        resolve();
      }, POLL_FREQUENCY);
    });
  },

  pollUntilGenNodesScaledToZero() {
    return new Promise(resolve => {
      const interval = setInterval(async () => {
        const nodes = await kubectl.getGeneratorNodesCount();
        if (nodes !== 0) return;

        clearInterval(interval);
        resolve();
      }, POLL_FREQUENCY);
    });
  }
};

export default loadGenerators;