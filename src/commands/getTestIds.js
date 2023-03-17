import Spinner from "../utilities/spinner.js";
import dbApi from "../utilities/dbApi.js";

const getTestIds = (testPath, numVus) => {
  const spinner = new Spinner("Retrieving all test ids...");
  dbApi
    .getTestIds()
    .then(ids => {
      spinner.succeed();
      console.log(ids);
    })
    .catch((err) => {
      spinner.fail(`Error running test: ${err}`);
    });
};

export { getTestIds };
