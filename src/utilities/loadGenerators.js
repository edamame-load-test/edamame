import {
  K6_TEST_POD_REGEX,
  POLL_FREQUENCY,
  LOAD_GEN_NODE_GRP,
  SPECIALIZED_NODES_UNAVAILABLE_TIMEOUT
} from "../constants/constants.js";
import kubectl from "./kubectl.js";

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

  async checkAllCompleted(totalTests) {
    let { stdout } = await kubectl.getPods();
    const currComplete = this.numTestsCompleted(stdout);
    
    if (currComplete === totalTests) {
      return true;
    }
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

  pollUntilLoadNodesReady(numNodes, nodeType, nodeGroup, nodeDesc) {
    return new Promise((resolve, reject) => {
      const timeOut = setTimeout(async () => {
        clearInterval(interval);
        let warning = `WARNING: The ${nodeType} ${nodeDesc} lack`+
          `${nodeDesc.match("nodes") ? "" : "s"} availability in your AWS region.` +
          " Edamame will proceed to stop the execution of your load test.";
        reject(new Error(warning));
      }, SPECIALIZED_NODES_UNAVAILABLE_TIMEOUT);
  
      const interval = setInterval(async () => {
        const readyNodes = await kubectl.getLoadNodesReadyCount(nodeGroup);
        if (readyNodes !== numNodes) return;

        clearInterval(interval);
        clearTimeout(timeOut);
        resolve();
      }, POLL_FREQUENCY);
    });
  },

  pollUntilGenNodesScaleDown() {
    return new Promise(resolve => {
      const interval = setInterval(async () => {
        const nodes = await kubectl.getLoadNodesCount(LOAD_GEN_NODE_GRP);
        if (nodes !== 0) return;
      
        clearInterval(interval);
        resolve();
      }, POLL_FREQUENCY);
    });
  }
};

export default loadGenerators;
