import fs from "fs";
import ora from "ora";
import kubectl from "../utilities/kubectl.js";
import loadGenerators from "../utilities/loadGenerators.js";
import cli from "../utilities/cli.js";
import cluster from "../utilities/cluster.js";


const runTest = (testPath, numVus, configMapName) => {
  if (fs.existsSync(testPath)) {
    const spinner = ora("Distributing k6 load test...").start();
    cluster.launchK6Test(testPath, numVus, configMapName, spinner)
      .then(() => cli(spinner, "Starting k6 load test..."))
      .then(() => loadGenerators.pollUntilAllComplete(numVus))
      .then(() => cli(spinner, "All tests completed; Removing load generators."))
      .then(() => cluster.phaseOutK6(configMapName))
      .then(() => cli(spinner, "Removed load generating components from cluster.", "success"))
      .catch(err => cli(spinner, `Error running test: ${err}`, "fail"));
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
