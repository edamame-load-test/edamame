import aws from "../utilities/aws.js";
import archiver from "../utilities/archiver.js";
import Spinner from "../utilities/spinner.js";
import archiveMessage from "../utilities/archiveMessage.js";
import { RESTORE_BEFORE_IMPORT_S3_REGEX } from "../constants/constants.js";

const restore = async (options) => {
  const spinner = new Spinner(archiveMessage.startRestore);
  const { name, days } = options;
  const numDays = Number(days);

  try {
    const stdout = await aws.s3ObjectExists(name);
    if (!stdout) {
      throw Error(archiveMessage.noObject(name));
    }

    if (stdout.match(RESTORE_BEFORE_IMPORT_S3_REGEX)) {
      const type = stdout.match("INTELLIGENT_TIERING")
        ? "intelligent_tiering"
        : "glacier";
      if (type === "glacier") {
        if (isNaN(numDays) || numDays < 0 || numDays > 30 || days.match(/\./)) {
          throw Error(archiveMessage.invalidRestoreDays(days));
        }
      }
      await aws.restoreS3Object(name, days, type);
      spinner.succeed(archiveMessage.restorationInProgress(name));
    } else {
      spinner.succeed(archiveMessage.noRestorationNeeded(name));
    }
  } catch (error) {
    if (error.message.match("Bad Request")) {
      spinner.fail(archiveMessage.noBucket);
    } else {
      spinner.fail(error.message);
    }
  }
};

export { restore };
