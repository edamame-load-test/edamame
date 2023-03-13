import files from "../utilities/files.js";
import loadGenerators from "../utilities/loadGenerators.js";
import Spinner from "../utilities/spinner.js";
import cluster from "../utilities/cluster.js";
import manifest from "../utilities/manifest.js";

const runTest = (testPath) => {
  const numVus = manifest.numVus(testPath);
  if (numVus > 0) {
    const spinner = new Spinner("Distributing k6 load test...");
    
    cluster.launchK6Test(testPath, numVus)
      .then(() => spinner.update("Running k6 load test..."))
      .then(() => loadGenerators.pollUntilAllComplete(numVus))
      .then(() => spinner.update("All tests completed; Removing load generators."))
      .then(() => cluster.phaseOutK6())
      .then(() => spinner.succeed("Removed load generating components from cluster."))
      .catch(err => spinner.fail(`Error running test: ${err}`));
  } else {
    console.log(
      `Either couldn't find k6 test script at: ${testPath} ` +
      `Or the file specifies 0 total number of vus.`
    );
  }
};

export {
  runTest
};
