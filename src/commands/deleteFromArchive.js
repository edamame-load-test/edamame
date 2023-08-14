import aws from "../utilities/aws.js";
import Spinner from "../utilities/spinner.js";
import archiveMessage from "../utilities/archiveMessage.js";

const deleteFromArchive = async (options) => {
  const spinner = new Spinner(archiveMessage.startDeletion);
  const testName = options.name;

  try {
    if (testName) {
      const exists = await aws.s3ObjectExists(testName);
      if (!exists) throw Error(archiveMessage.noObject(testName));

      await aws.deleteObjectFromS3Bucket(testName);
      spinner.succeed(archiveMessage.singleDeletionSuccess(testName));
    } else {
      await aws.deleteS3Bucket();
      spinner.succeed(archiveMessage.deletedBucket);
    }
  } catch (err) {
    processDeleteError(err, spinner);
  }
};

const processDeleteError = (error, spinner) => {
  if (error.message.match("No s3 object")) {
    spinner.fail(error.message);
  } else if (error.stderr && error.stderr.match("NoSuchBucket")) {
    spinner.fail(archiveMessage.noBucket);
  } else {
    spinner.fail(archiveMessage.error(error, "delete"));
  }
};

export { deleteFromArchive };
