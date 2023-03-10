import kubectl from "../utilities/kubectl.js";
import loadGenerators from "../utilities/loadGenerators.js";
import cli from "../utilities/cli.js";
import fs from "fs";
import ora from "ora";

const askUserForNewPath = (currPath) => {
  console.log(
    "Couldn't find k6 test script at the specified location: " +
    `${testFilePath}. Please re-run run-test with the correct ` +
    " filepath that's relative to your current subdirectory."
  );
}

const runTest = (testPath, numVus, configMapName) => {
  if (fs.existsSync(testPath)) {
    const spinner = ora("Distributing k6 load test...").start();

    kubectl.launchK6Test(testPath, numVus, configMapName, spinner)
      .then(() => loadGenerators.pollUntilAllComplete(numVus))
      .then(() => cli(spinner, "All tests completed; removing load generators"))
      .then(() => kubectl.phaseOutK6(configMapName))
      .then(() => cli(spinner, "Removed load generating components from cluster", "success"))
      .catch(error => {
        cli(spinner, `Load test Error: ${error}`, "fail");
      })
  } else {
    askUserForNewPath(testPath);
  }
};

export {
  runTest
};
