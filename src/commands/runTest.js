import kubectl from "../utilities/kubectl.js";
import fs from "fs";

const runTest = (testFilePath, numVus, configMapName) => {
  if (fs.existsSync(testFilePath)) {
    kubectl.launchK6Test(testFilePath, numVus, configMapName);
  } else {
    console.log(
      "Couldn't find k6 test script at the specified location: " +
      `${testFilePath}. Please re-run run-test with the correct ` +
      " filepath that's relative to your current subdirectory."
    );
  }
};

export {
  runTest
};
