import kubectl from "../utilities/kubectl.js";
import fs from "fs";

const runTest = (testFilePath, numVus, configMapName) => {
  try {
    if (fs.existsSync(testFilePath)) {
      kubectl.launchK6Test(testFilePath, numVus, configMapName);
    }
  } catch(error) {
    console.log(error);
    console.log(`Couldn't find k6 test script at the specified location ${testFilePath}. Please try again`);
  }
};

export {
  runTest
};
