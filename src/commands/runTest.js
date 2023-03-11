import fs from "fs";
import loadGenerators from "../utilities/loadGenerators.js";
import Spinner from "../utilities/spinner.js";
import cluster from "../utilities/cluster.js";


const runTest = (testPath, numVus) => {
  if (fs.existsSync(testPath)) {
    const spinner = new Spinner("Distributing k6 load test...");
    cluster.launchK6Test(testPath, numVus)
      .then(() => spinner.update("Starting k6 load test..."))
      .then(() => loadGenerators.pollUntilAllComplete(numVus))
      .then(() => spinner.update("All tests completed; Removing load generators."))
      .then(() => cluster.phaseOutK6())
      .then(() => spinner.succeed("Removed load generating components from cluster."))
      .catch(err => spinner.fail(`Error running test: ${err}`));
  } else {
    console.log(
      `Couldn't find k6 test script at: ${testPath} ` +
      `Please re-run run-test with a filepath relative `
      `to your current subdirectory.`
    );
  }
};

export {
  runTest
};
