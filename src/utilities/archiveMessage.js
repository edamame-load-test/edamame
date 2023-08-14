import files from "./files.js";

const archiveMessage = {
  noTests: "There are no tests to archive",

  start: "Starting archive process...",

  bucketReady: "AWS S3 Bucket is ready for uploads.",

  noBucket: "There's no AWS S3 bucket containing load tests.",

  startDisplay: "Loading AWS S3 Bucket archive details...",

  startImport:
    "Starting process to import AWS S3 archived data into Postgres database...",

  emptyBucket: "Your AWS S3 Edamame load test bucket is empty.",

  startRestore: "Starting restoration of AWS S3 object...",

  deletedBucket: "Deleted Edamame load test AWS S3 bucket",

  startDeletion: "Starting archival deletion process...",

  importComplete: "Completed importing data from AWS S3.",

  exportComplete: "Archive process complete.",

  defaultStorageClass:
    "No S3 storage class has been specified, so the default STANDARD S3 storage class will be used.",

  restoreInProgress:
    "S3 Object is in the process of being restored and can't be imported yet.",

  restorationInProgress(name) {
    return (
      `AWS S3 restoration process is in progress. Once its complete you ` +
      ` can import data associated with ${name} into your current Edamame ` +
      ` EKS cluster or move the S3 object elsewhere.`
    );
  },

  restoreBeforeImport(testName) {
    return (
      `Can't import ${testName}; Its S3 storage class requires it` +
      ` to be restored before imported.\n See the edamame restore` +
      ` command in the docs for more details.`
    );
  },

  noRestorationNeeded(testName) {
    return (
      `AWS S3 Object associated with the test ${testName} ` +
      `doesn't have a storage class that requires restoration.`
    );
  },

  invalidRestoreDays(days) {
    return `Invalid days flag argument: ${days}. Number of days should be 1-30.`;
  },

  nonexistentTest(testName) {
    return `Nonexistent test to archive: ${testName}.`;
  },

  alreadyExists(name) {
    return `Archive for ${name} already exists. Skipping to next step.`;
  },

  uploadSuccess(name) {
    return `Successfully archived ${name}.`;
  },

  sizeIssue(testName) {
    return (
      `There was an issue archiving your load test: ${testName}.` +
      ` It seems your load test had enough data to exceed the` +
      ` upload size limit. Please reach out to an Edamame` +
      ` developer for a custom archive solution for this test.`
    );
  },

  display(s3Contents) {
    return (
      `Your Edamame load test AWS S3 Bucket contains ` +
      `the following load test S3 objects:\n > ${s3Contents.join("\n > ")}`
    );
  },

  duplicateImport(testName) {
    return (
      `AWS S3 archive data for ${testName} overlaps with existing` +
      ` data in the database. Can't import duplicate information.`
    );
  },

  error(errorInfo, type) {
    let msg;
    if (type === "upload") {
      msg = `Error archiving load test data: \n${errorInfo}`;
    } else if (type === "delete") {
      msg = `Error deleting load test data from AWS S3 storage: \n${errorInfo}`;
    } else if (type === "display") {
      msg = `Error retrieving details about your AWS S3 Bucket: \n${errorInfo}`;
    } else {
      msg = `Error importing load test data from archive into cluster database: \n${errorInfo}`;
    }
    return msg;
  },

  noObject(testName) {
    return `There's no AWS S3 object associated with the test named ${testName}.`;
  },

  singleDeletionSuccess(name) {
    return `Successfully deleted ${name} from your Edamame load test AWS S3 Bucket.`;
  },

  singleImportFail(name) {
    return `Issue importing ${testName}. Please try again later.`;
  },

  createBucketInRegion() {
    const region = files
      .read(files.path("postgres.env"))
      .match("aws-region=.{1,}\n")[0];

    return (
      `Creating load test AWS S3 Bucket ` +
      `located in: ${region} if it doesn't exist yet...`
    );
  },
};

export default archiveMessage;
