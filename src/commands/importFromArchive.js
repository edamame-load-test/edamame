import aws from "../utilities/aws.js";
import archiver from "../utilities/archiver.js";
import Spinner from "../utilities/spinner.js";
import archiveMessage from "../utilities/archiveMessage.js";

const importFromArchive = async (options) => {
  const spinner = new Spinner(archiveMessage.startImport);
  const testName = options.name;

  try {
    const bucketExists = await aws.archiveBucketExists();
    if (!bucketExists) throw Error(archiveMessage.noBucket);
    const s3Objects = await archiver.s3ObjectsToImport(testName, spinner);
    for (let i = 0; i < s3Objects.length; i++) {
      await archiver.singleImport(s3Objects[i], spinner);
    }
    if (s3Objects.length > 0) {
      spinner.succeed(archiveMessage.importComplete);
    } else {
      spinner.succeed(`No S3 Objects imported.`);
    }
  } catch (err) {
    archiver.processImportError(err, spinner);
  }
};

export { importFromArchive };
