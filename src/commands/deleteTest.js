import Spinner from "../utilities/spinner.js";
import dbApi from "../utilities/dbApi.js";

const deleteTest = (name) => {
  const spinner = new Spinner(`Deleting the test named: '${name}'...`);
  dbApi
    .getTest(name)
    .then(test => {
      if (test) {
        dbApi.deleteTest(test.id)
          .then(() => {
            spinner.succeed(`Deleted the test named: '${name}'`);
          })
      } else {
        spinner.fail(`Couldn't find a test associated with the name: '${name}'`);
      }
    })
    .catch((err) => {
      spinner.fail(`Error deleting test: ${err}`);
    });
};

export { deleteTest };
