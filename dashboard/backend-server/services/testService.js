import { ARCHIVE } from "../../../src/constants/constants.js";
import { promisify } from "util";
import child_process from "child_process";
const exec = promisify(child_process.exec);

const testService = {
  async setupS3Bucket() {
    try {
      const { stdout } = await exec(`aws s3 ls s3://${ARCHIVE}`);
    } catch {
      await exec(`aws s3 mb s3://${ARCHIVE}`);
    }
  },

  async testArchiveExists(testName) {
    const command =
      `aws s3api head-object --bucket ${ARCHIVE} ` +
      `--key ${testName.replaceAll(" ", "")}.tar.gz`;

    try {
      const { stdout } = await exec(command);
      return stdout !== "";
    } catch {
      return false;
    }
  },
};

export default testService;
