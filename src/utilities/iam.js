import {
  EBS_CSI_DRIVER_REGEX,
  AWS_LBC_POLICY_REGEX,
} from "../constants/constants.js";
import files from "./files.js";

const iam = {
  deleteAWSLbcPolArn() {
    if (files.exists(files.path(".env"))) {
      const data = files.read(files.path(".env"));
      const policyArn = data.split("\n")[0].split("=")[1];
      files.write(".env", "");
      return policyArn;
    }
    return "";
  },

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

  lbcPolicyArn(stdout) {
    let policy;
    const properties = stdout.split("\n");

    for (let i = 0; i < properties.length; i++) {
      let property = properties[i];
      if (property.match(`"Arn":`)) {
        policy = property.match(AWS_LBC_POLICY_REGEX)[0];
        this.logAWSLbcPolArn(policy);
        return policy;
      }
    }
  },

  logAWSLbcPolArn(policy) {
    const data = `alb_pol_arn=${policy}\n`;
    files.write(".env", data);
  },
};

export default iam;
