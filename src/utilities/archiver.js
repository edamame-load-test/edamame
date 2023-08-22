import aws from "../utilities/aws.js";
import dbApi from "../utilities/dbApi.js";
import archiveMessage from "../utilities/archiveMessage.js";
import {
  DEFAULT_AWS_S3_STORAGE_CLASS,
  RESTORE_BEFORE_IMPORT_S3_REGEX,
  VALID_STORAGE_CLASSES,
} from "../constants/constants.js";

const archiver = {
  async uploadToAWS(testName, spinner, storageClass) {
    try {
      const exists = await aws.s3ObjectExists(testName);

      if (exists) {
        spinner.info(archiveMessage.alreadyExists(testName));
      } else {
        await dbApi.archive("archive", testName, storageClass);
        spinner.info(archiveMessage.uploadSuccess(testName));
      }
    } catch (error) {
      spinner.info(archiveMessage.sizeIssue(testName));
    }
  },

  validateStorageClass(storageClass) {
    if (storageClass === undefined) {
      return DEFAULT_AWS_S3_STORAGE_CLASS;
    }

    if (VALID_STORAGE_CLASSES.hasOwnProperty(storageClass)) {
      return storageClass;
    } else {
      throw Error(`Invalid AWS S3 storage class specified: ${storageClass}`);
    }
  },

  async allTestsToArchive(testName) {
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
  },

  async validateObjectToImport(testName, spinner, list) {
    const stdout = await aws.s3ObjectExists(testName);
    if (!stdout) {
      spinner.info(archiveMessage.noObject(testName));
    } else if (stdout.match(RESTORE_BEFORE_IMPORT_S3_REGEX)) {
      try {
        if (!this.restoreComplete(stdout)) {
          spinner.info(archiveMessage.restoreInProgress);
        } else {
          list.push(testName);
        }
      } catch {
        spinner.info(archiveMessage.restoreBeforeImport(testName));
      }
    } else {
      list.push(testName);
    }
  },

  async s3ObjectsToImport(testName, spinner) {
    let imports = [];
    if (testName !== undefined) {
      await this.validateObjectToImport(testName, spinner, imports);
    } else {
      let s3Objects = await aws.listObjectsInS3Bucket();
      for (let i = 0; i < s3Objects.length; i++) {
        const testName = s3Objects[i].split(".")[0];
        await this.validateObjectToImport(testName, spinner, imports);
      }
    }
    return imports;
  },

  async singleImport(testName, spinner) {
    try {
      const response = await dbApi.archive("import", testName);
      if (response.success) {
        spinner.info(response.success);
      }
    } catch (err) {
      const duplicate =
        err.response &&
        err.response.data &&
        err.response.data.error &&
        err.response.data.error.match("duplicate");

      const message = duplicate
        ? archiveMessage.duplicateImport(testName)
        : archiveMessage.singleImportFail(testName);

      spinner.info(message);
    }
  },

  processImportError(error, spinner) {
    if (error.message.match("no AWS S3")) {
      spinner.fail(error.message);
    } else {
      spinner.fail(archiveMessage.error(error, "import"));
    }
  },

  restoreComplete(stdout) {
    const restore = stdout
      .split("\n")
      .filter((line) => line.match("Restore"))[0];
    if (restore.match("expiry-date")) {
      return true;
    } else {
      return false;
    }
  },
};

export default archiver;
