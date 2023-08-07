import aws from "../utilities/aws.js";
import dbApi from "../utilities/dbApi.js";
import archiveMessage from "../utilities/archiveMessage.js";
import Spinner from "../utilities/spinner.js";

const uploadToAWS = async (testName, spinner) => {
  try {
    const s3Name = aws.s3ObjectNameForTest(testName);
    const exists = await aws.s3ObjectExists(s3Name);

    if (exists) {
      spinner.info(archiveMessage.alreadyExists(testName));
    } else {
      await dbApi.archive("archive", testName);
      spinner.info(archiveMessage.uploadSuccess(testName));
    }
  } catch (error) {
    spinner.info(archiveMessage.sizeIssue(testName));
  }
};

const allTestsToArchive = async (testName) => {
  let testsToArchive;
  if (testName) {
    const test = await dbApi.getTest(testName);
    if (!test) {
      throw new Error(archiveMessage.nonexistentTest(testName));
    }
    testsToArchive = [test];
  } else {
    testsToArchive = await dbApi.getAllTests();
    if (testsToArchive.length === 0) {
      throw new Error(archiveMessage.noTests);
    }
  }
  return testsToArchive;
};

const archive = async (options) => {
  const spinner = new Spinner(archiveMessage.start);
  const testName = options.name;

  try {
    const testsToArchive = await allTestsToArchive(testName);
    spinner.info(archiveMessage.createBucketInRegion());
    await aws.setUpArchiveBucket();
    spinner.info(archiveMessage.bucketReady);

    for (let i = 0; i < testsToArchive.length; i++) {
      await uploadToAWS(testsToArchive[i].name, spinner);
    }

    spinner.succeed(archiveMessage.exportComplete);
  } catch (err) {
    spinner.fail(archiveMessage.error(err, "upload"));
  }
};

export { archive };
