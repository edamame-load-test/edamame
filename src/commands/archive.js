import aws from "../utilities/aws.js";
import dbApi from "../utilities/dbApi.js";
import files from "../utilities/files.js";
import Spinner from "../utilities/spinner.js";
import { ARCHIVE } from "../constants/constants.js";

const archive = async (options) => {
  const spinner = new Spinner("Starting archive process...");
  const testName = options.name;
  let testsToArchive;
  
  try {
    if (testName) {
      const test = await dbApi.getTest(testName);
      if (!test) {
        throw new Error(`Nonexistent test to archive: ${testName}.`);
      }
      testsToArchive = [test];
    } else {
      testsToArchive = await dbApi.getAllTests();
      if (testsToArchive.length === 0) {
        throw new Error(`There are no tests to archive.`);
      }
    }
    let region = files.read(files.path("postgres.env")).match("aws-region=.{1,}\n")[0];
    spinner.info(
      `Creating ${ARCHIVE} AWS S3 Bucket` +
      `located at: ${region} if it doesn't exist yet...`
    );
    await aws.setUpArchiveBucket();
    spinner.info("AWS S3 Bucket is ready for uploads.");
    let numArchived = 0;
    
    for (let i = 0; i < testsToArchive.length; i++) {
      let name = testsToArchive[i].name;
      try {
        const exists = aws.s3ObjectExists(aws.s3ObjectNameForTest(name));
        if (!exists) {
          spinner.info(`Archive for ${name} already exists. Skipping to next archive step.`);
        } else {
          await dbApi.archiveTest(name);
          spinner.info(`Successfully archived ${name}.`);
          numArchived += 1;
        }
      } catch (error) {
        console.log(error);
        spinner.info(
          `There was an issue archiving your load test: ${name}.` +
          ` It seems your load test had enough data to exceed the` +
          ` upload size limit. Please reach out to an edamame` +
          ` developer for a custom archive solution for this test.`
        );
      }
    }

    spinner.succeed(
      `Archival process complete. Uploaded ${numArchived} load ` +
      `test objects to the AWS S3 Bucket: ${ARCHIVE}`
    );
  } catch (err) {
    spinner.fail(`Error archiving load test data: ${err}`);
  }
};

export { archive };
