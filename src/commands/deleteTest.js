import Spinner from "../utilities/spinner.js";
import dbApi from "../utilities/dbApi.js";

const deleteTest = async (name) => {
  const spinner = new Spinner(`Deleting the test named: '${name}'...`);

  try {
    let test = await dbApi.getTest(name);
    if (test) {
      await dbApi.deleteTest(test.id);
      spinner.succeed(`Deleted the test named: '${name}'`);
    } else {
      spinner.fail(`Couldn't find a test associated with the name: '${name}'`);
    }
  } catch (err) {
    spinner.fail(`Error deleting test: ${err}`);
  }
};

export { deleteTest };
