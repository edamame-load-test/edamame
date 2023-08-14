import {
  AWS_LBC_IAM_POLNAME,
  CLUSTER_NAME,
  ARCHIVE,
  GEN_NODE_GROUP_FILE,
  MIN_NUM_DASHES_FOR_GTEQ_2_AWS_AVZONES,
} from "../constants/constants.js";
import { promisify } from "util";
import iam from "./iam.js";
import eksctl from "./eksctl.js";
import files from "./files.js";
import child_process from "child_process";
const exec = promisify(child_process.exec);

const aws = {
  async deleteOldStacks() {
    const { stdout } = await exec(`aws cloudformation describe-stacks`);
    stdout.split("\n").forEach(async (line) => {
      if (line.match(`"StackName": "eksctl-edamame`)) {
        let stackName = line
          .split(`"`)
          .filter((part) => part.match("edamame"))[0];
        await exec(`aws cloudformation delete-stack --stack-name ${stackName}`);
      }
    });
  },

  async throwErrorIfInvalidZone(zones) {
    this.checkForInvalidZoneList(zones);
    let userZones = zones.split(",");
    let possibleZones = await this.usersPossibleZones();
    let invalid = false;
    let invalidZone;

    for (let i = 0; i < userZones.length; i++) {
      let zone = userZones[i];
      if (!possibleZones[zone]) {
        invalid = true;
        invalidZone = zone;
        break;
      }
    }

    if (invalid) {
      let msg =
        `One of your specified zones, ${invalidZone}, isn't in ` +
        `the list of aws availability zones for your region`;
      throw Error(msg);
    }
  },

  checkForInvalidZoneList(zones) {
    let numDashes = zones.split("").filter((char) => char === "-").length;
    if (
      (!zones.match(",") &&
        numDashes >= MIN_NUM_DASHES_FOR_GTEQ_2_AWS_AVZONES) ||
      !zones.match("-")
    ) {
      let msg =
        `When specifying >1 availability zones, please ` +
        `specify the desired zones as a comma separated list` +
        ` like so: "us-east-1a,us-east-1b"`;
      throw Error(msg);
    }
  },

  async usersPossibleZones() {
    const command = `aws ec2 describe-availability-zones --all-availability-zones`;
    const { stdout } = await exec(command);
    let zones = stdout.split("\n").filter((line) => line.match(`"ZoneName"`));
    let zonesLookup = {};

    zones.forEach((zoneDesc) => {
      let zoneKey = zoneDesc
        .split(`"ZoneName": `)
        .filter((info) => info !== "")[1];
      zoneKey = zoneKey.replace(",", "").replaceAll(`"`, "");
      zonesLookup[zoneKey] = zoneDesc;
    });

    return zonesLookup;
  },

  async newIamLBCPolicy() {
    let oldPolicy = iam.deleteAWSLbcPolArn();
    await this.deleteOldIamLBCPolicy(oldPolicy);

    const { stdout } = await exec(
      `cd ${files.path("")} && aws iam create-policy ` +
        `--policy-name ${AWS_LBC_IAM_POLNAME} ` +
        "--policy-document file://iam_policy.json"
    );
    const policyArn = iam.lbcPolicyArn(stdout);
    await eksctl.createIamRoleLBCPol(policyArn);
  },

  fetchOIDCs() {
    const OIDC =
      `aws eks describe-cluster ` +
      `--name ${CLUSTER_NAME} ` +
      '--query "cluster.identity.oidc.issuer" ' +
      "--output text | cut -d '/' -f 5";

    const listOIDCs = "aws iam list-open-id-connect-providers";

    return exec(`${OIDC} && ${listOIDCs}`);
  },

  deleteOldIamLBCPolicy(policy) {
    if (policy) {
      return exec(`aws iam delete-policy --policy-arn ${policy}`);
    }
  },

  async checkOfferedInstanceTypes(nodeType) {
    const nodeGroupData = files.readYAML(GEN_NODE_GROUP_FILE);
    const region = nodeGroupData.metadata.region;

    const { stdout } = await this.describeInstanceTypes(nodeType, region);
    let msg =
      `Edamame has checked the instance types available in your ` +
      `AWS region, ${region}, and the ${nodeType} nodes are`;

    console.log(`${msg} ${this.nodeTypeAvailableMsg(stdout)}`);
  },

  nodeTypeAvailableMsg(stdout, nodeType) {
    let msg;
    if (stdout.match(nodeType)) {
      msg =
        `generally available:\n ${stdout} \n If you ` +
        "initialized the Edamame cluster with the optional " +
        "--zones flag, please double check that you specified " +
        "at least one of the availability zones shown in the " +
        "table output above. Otherwise, please try executing " +
        "your load test again later, as the required AWS " +
        "instance types should become available again.";
    } else {
      msg =
        `not generally available:\n ${stdout} \n` +
        ` Please switch AWS regions or contact Edamame` +
        ` developers, so that we can extend Edamame's` +
        ` options for you region's specialized needs.`;
    }
    return msg;
  },

  async describeInstanceTypes(nodeType, region) {
    const command =
      `aws ec2 describe-instance-type-offerings ` +
      `--location-type availability-zone ` +
      `--filters Name=instance-type,` +
      `Values=${nodeType} --region ${region} ` +
      `--output table`;

    return exec(command);
  },

  async deleteEBSVolumes() {
    let volumesCommand =
      `aws ec2 describe-volumes --filter ` +
      `"Name=tag:kubernetes.io/created-for/pvc/name,` +
      `Values=data-postgres-0,grafana-pvc" --query` +
      ` 'Volumes[].VolumeId' --output json`;

    let volumes = await exec(`${volumesCommand}`);
    volumes = JSON.parse(volumes.stdout);

    return Promise.allSettled(
      volumes.map((volume) => {
        exec(`aws ec2 delete-volume --volume-id ${volume}`);
      })
    );
  },

  async getConfiguration(type) {
    const { stdout } = await exec(`aws configure get ${type}`);
    return stdout.replace("\n", "");
  },

  async getAccountId() {
    const { stdout } = await exec("aws sts get-caller-identity");
    let accountId = stdout.match(/Account": .{1,}"/)[0];
    return accountId.split(": ")[1];
  },

  async currentCLICredentials() {
    let region = await this.getConfiguration("region");
    let accountId = await this.getAccountId();
    let accessKey = await this.getConfiguration("aws_access_key_id");
    let secretKey = await this.getConfiguration("aws_secret_access_key");
    return {
      region,
      accountId,
      accessKey,
      secretKey,
    };
  },

  async archiveBucketExists() {
    try {
      await exec(`aws s3 ls s3://${ARCHIVE}`);
      return true;
    } catch (error) {
      if (error.stderr.match("NoSuchBucket")) {
        return false;
      } else {
        // unknown error; abort process
        throw Error(error);
      }
    }
  },

  s3ObjectNameForTest(testName) {
    return `${testName.replaceAll(" ", "")}.tar.gz`;
  },

  async s3ObjectExists(testName) {
    try {
      const key = this.s3ObjectNameForTest(testName);
      const command = `aws s3api head-object --bucket ${ARCHIVE} --key ${key}`;
      const { stdout } = await exec(command);
      return stdout;
    } catch (error) {
      if (error.stderr.match("Not Found")) {
        // file doesn't exist yet
        return false;
      } else {
        // unknown error; abort process
        throw Error(error);
      }
    }
  },

  async restoreS3Object(testName, days, type) {
    const key = this.s3ObjectNameForTest(testName);
    let command =
      `aws s3api restore-object --bucket ${ARCHIVE} ` +
      `--key ${key} --restore-request `;
    if (type === "glacier") {
      command += `'{"Days":${days},"GlacierJobParameters":{"Tier":"Standard"}}'`;
    } else {
      command += `'{}'`;
    }
    return exec(command);
  },

  async listObjectsInS3Bucket() {
    const { stdout } = await exec(`aws s3 ls s3://${ARCHIVE} --recursive`);
    const fileNames = [];
    stdout.split("\n").forEach((line) => {
      if (line) {
        const fileDetails = line.split(/\s/);
        fileNames.push(fileDetails[fileDetails.length - 1]);
      }
    });
    return fileNames;
  },

  async setUpArchiveBucket() {
    let exists = await this.archiveBucketExists();
    if (!exists) {
      await exec(`aws s3 mb s3://${ARCHIVE}`);
    }
  },

  async deleteS3Bucket() {
    await exec(`aws s3 rb s3://${ARCHIVE} --force`);
  },

  async deleteObjectFromS3Bucket(testName) {
    const key = this.s3ObjectNameForTest(testName);
    await exec(`aws s3api delete-object --bucket ${ARCHIVE} --key ${key}`);
  },
};

export default aws;
