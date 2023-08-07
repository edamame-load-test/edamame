import aws from "../utilities/aws.js";
import Spinner from "../utilities/spinner.js";
import archiveMessage from "../utilities/archiveMessage.js";

const showArchiveContents = async () => {
  const spinner = new Spinner(archiveMessage.startDisplay);

  try {
    let s3Objects = await aws.listObjectsInS3Bucket();
    if (s3Objects.length === 0) {
      spinner.succeed(archiveMessage.emptyBucket);
    } else {
      spinner.succeed(archiveMessage.display(s3Objects));
    }
  } catch (err) {
    if (err.stderr && err.stderr.match("NoSuchBucket")) {
      spinner.fail(archiveMessage.noBucket);
    } else {
      spinner.fail(archiveMessage.error(err, "display"));
    }
  }
};

export { showArchiveContents };
