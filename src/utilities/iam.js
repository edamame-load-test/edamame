import { EBS_CSI_DRIVER_REGEX } from "../constants/constants.js";
import child_process from "child_process";
import { promisify } from "util";
const exec = promisify(child_process.exec);

const iam = {
  ebsRole(stdout) {
    const nameRole = stdout.match(EBS_CSI_DRIVER_REGEX);
    return nameRole ? nameRole[0].split("\t")[1] : undefined;
  },

  OIDCexists(stdout) {
    const oidcAndList = stdout.split("OpenIDConnectProviderList");
    const oidc = oidcAndList[0].split("\n")[0];
    const list = oidcAndList[1];
    return list.match(oidc) === null ? false : true;
  },

};

export default iam;
