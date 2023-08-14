import aws from "../utilities/aws.js";
import archiveMessage from "../utilities/archiveMessage.js";
import archiver from "../utilities/archiver.js";
import Spinner from "../utilities/spinner.js";

const archive = async (options) => {
  const spinner = new Spinner(archiveMessage.start);
  const testName = options.name;
  const storage = options.storage;

  try {
    const storageClass = archiver.validateStorageClass(storage);
    if (storage === undefined) {
      spinner.info(archiveMessage.defaultStorageClass);
    }
    const testsToArchive = await archiver.allTestsToArchive(testName);
    spinner.info(archiveMessage.createBucketInRegion());
    await aws.setUpArchiveBucket();
    spinner.info(archiveMessage.bucketReady);

    for (let i = 0; i < testsToArchive.length; i++) {
      await archiver.uploadToAWS(testsToArchive[i].name, spinner, storageClass);
    }

    spinner.succeed(archiveMessage.exportComplete);
  } catch (err) {
    if (err.message.match("Invalid AWS S3 storage class")) {
      spinner.fail(`${err.message}\n ${archiveMessage.validStorageClasses()}`);
    } else {
      spinner.fail(archiveMessage.error(err, "upload"));
    }
  }
};

export { archive };
