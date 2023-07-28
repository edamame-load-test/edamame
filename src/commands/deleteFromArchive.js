import aws from "../utilities/aws.js";
import dbApi from "../utilities/dbApi.js";
import Spinner from "../utilities/spinner.js";
import { 
  ARCHIVE
} from "../constants/constants.js";

const deleteFromArchive = async (options) => {
  const spinner = new Spinner("Starting archival deletion process...");
  const testName = options.name;

  try {
    if (testName) {
      const test = await dbApi.getTest(testName);
      if (!test) {
        throw new Error(`Nonexistent test to unarchive: ${testName}.`);
      }
      await aws.deleteObjectFromS3Bucket(`${testName}.tar.gz`);
      spinner.succeed(
        `Successfully deleted ${testName} from the AWS S3 Bucket: ${ARCHIVE}`);
    } else {
      await aws.deleteS3Bucket();
      spinner.succeed(`Deleted AWS S3 bucket: ${ARCHIVE}`);
    }
  } catch (err) {
    if (err.stderr.match("NoSuchBucket")) {
      spinner.fail(`There's no AWS S3 ${ARCHIVE} bucket to delete.`);
    } else {
      spinner.fail(`Error deleting load test data from AWS S3 storage: ${err}`);
    }
  }
};

export { deleteFromArchive };
