import Spinner from "../utilities/spinner.js";
import dbApi from "../utilities/dbApi.js";

const updateTestName = async (options) => {
  const currName = options.current;
  const newName = options.new;
  const spinner = new Spinner(`Updating test name from '${currName}' to '${newName}'...`);

  try {
    if (!newName.replace(/\s/g, '').length) {
      spinner.fail(`Proposed name can't be undefined.`);
      return;
    }
    
    let exists = await dbApi.nameExists(newName);
    if (exists) {
      spinner.fail(`The proposed name, ${newName}, is already associated with a test.`);
      return;
    }

    let test = await dbApi.getTest(currName);
    if (test) {
      test = await dbApi.putRequest(test.id, { "name": newName });
      spinner.succeed(`Successfully updated test's name to: '${test.name}'`);
    } else {
      spinner.fail(`Couldn't update name, because couldn't find a test named: ${currName}`);
    }
  } catch (err) {
    spinner.fail(`Error updating the test name: ${err}`);
  }
};

export { updateTestName };
