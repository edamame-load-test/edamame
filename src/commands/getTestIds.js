import Spinner from "../utilities/spinner.js";
import dbApi from "../utilities/dbApi.js";

const getTestIds = (testPath, numVus) => {
  const spinner = new Spinner("Retrieving all test ids...");
  dbApi
    .getTestIds()
    .then(({ stdout }) => {
      spinner.succeed();
      console.log(stdout);
    })
    .catch((err) => {
      spinner.fail(`Error running test: ${err}`);
    });
};

export { getTestIds };
