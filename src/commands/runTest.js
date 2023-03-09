import kubectl from "../utilities/kubectl.js";
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
      //.then(() => poll to figure out when test finished & update spinner);
      .catch(error => {
        cli(
          spinner, 
          `Error during load test distribution: ${error}`,
          "fail"
        );
      })
  } else {
    askUserForNewPath(testPath);
  }
};

export {
  runTest
};
