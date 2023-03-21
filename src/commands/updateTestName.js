import Spinner from "../utilities/spinner.js";
import dbApi from "../utilities/dbApi.js";

const updateTestName = (options) => {
  const currName = options.current;
  const newName = options.new;
  const spinner = new Spinner(`Updating test name from '${currName}' to '${newName}'...`);

  if (!newName) {
    spinner.fail(`Proposed name can't be undefined ${err}`);
  }

  dbApi.nameExists(newName)
    .then(exists => {
      if (exists) {
        spinner.fail(`The proposed name, ${newName}, is already associated with a test.`);
      } else {
        dbApi
          .getTest(currName)
          .then(test => {
            if (test) {
              dbApi
                .putRequest(test.id, { "name": newName })
                .then(test => {
                  spinner.succeed(`Successfully updated test's name to: '${test.name}'`);
                })
            }
          })
          .catch(err => spinner.fail(`Error updating the test name: ${err}`))
      }
    });
};

export { updateTestName };
