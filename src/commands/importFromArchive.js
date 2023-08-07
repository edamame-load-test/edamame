import aws from "../utilities/aws.js";
import dbApi from "../utilities/dbApi.js";
import Spinner from "../utilities/spinner.js";
import archiveMessage from "../utilities/archiveMessage.js";

const singleImport = async (testName, spinner) => {
  try {
    const response = await dbApi.archive("import", testName);
    if (response.success) {
      spinner.info(response.success);
    }
  } catch (err) {
    const duplicate =
      err.response && err.response.data && err.response.data.error;

    const message = duplicate
      ? archiveMessage.duplicateImport(testName)
      : archiveMessage.singleImportFail(testName);

    spinner.info(message);
  }
};

const s3ObjectsToImport = async (testName) => {
  let imports;
  if (testName !== undefined) {
    const bucketExists = await aws.archiveBucketExists();
    if (!bucketExists) throw Error("NoSuchBucket");

    const testExists = aws.s3ObjectExists(aws.s3ObjectNameForTest(testName));
    if (!testExists) throw Error(archiveMessage.noObject(testName));

    imports = [testName];
  } else {
    let s3Objects = await aws.listObjectsInS3Bucket();
    imports = s3Objects.map((obj) => obj.split(".")[0]);
  }
  return imports;
};

const importFromArchive = async (options) => {
  const spinner = new Spinner(archiveMessage.startImport);
  const testName = options.name;

  try {
    const s3Objects = await s3ObjectsToImport(testName);
    for (let i = 0; i < s3Objects.length; i++) {
      await singleImport(s3Objects[i], spinner);
    }
    if (s3Objects.length > 0) {
      spinner.succeed(archiveMessage.importComplete);
    } else {
      spinner.succeed(`No imports; ${archiveMessage.emptyBucket}`);
    }
  } catch (err) {
    processImportError(err, spinner);
  }
};

const processImportError = (error, spinner) => {
  if (error.message.match("NoSuchBucket")) {
    spinner.fail(archiveMessage.noBucket);
  } else if (error.message.match("No s3 object")) {
    spinner.fail(error.message);
  } else {
    spinner.fail(archiveMessage.error(error, "import"));
  }
};

export { importFromArchive };
