import { 
  AWS_LBC_IAM_POLNAME,
  CLUSTER_NAME,
  GEN_NODE_GROUP_FILE,
  MIN_NUM_DASHES_FOR_GTEQ_2_AWS_AVZONES
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
        let stackName = line.split(`"`).filter(part => part.match("edamame"))[0];
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
      throw Error (`One of your specified zones, ${invalidZone}, isn't in the list of aws availability zones for your region`);
    }
  },

  checkForInvalidZoneList(zones) {
    let numDashes = zones.split("").filter(char => char === "-").length;
    if (!zones.match(",") && numDashes >= MIN_NUM_DASHES_FOR_GTEQ_2_AWS_AVZONES) {
      let msg = `When specifying >1 availability zones, please ` +
        `specify the desired zones as a comma separated list` +
        ` like so: "us-east-1a,us-east-1b"`;
      throw Error (msg);
    }
  },

  async usersPossibleZones() {
    let zones = await exec(`aws ec2 describe-availability-zones --all-availability-zones`);
    zones = zones.stdout.split("\n").filter(line => line.match(`"ZoneName"`));
    let zonesLookup = {};

    zones.forEach(zoneDesc => {
      let zoneKey = zoneDesc.split(`"ZoneName": `).filter(info => info !== "")[1].replace(",", "").replaceAll(`"`, "");
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
      return exec(
        `aws iam delete-policy --policy-arn ${policy}`
      );
    }
  },

  async checkOfferedInstanceTypes(nodeType) {
    const nodeGroupData = files.readYAML(GEN_NODE_GROUP_FILE);
    const region = nodeGroupData.metadata.region;

    const command = `aws ec2 describe-instance-type-offerings ` +
      `--location-type availability-zone --filters Name=instance-type,` +
      `Values=${nodeType} --region ${region} --output table`;

    const { stdout } = await exec(command);
    let msg = `Edamame has checked the instance types available in your ` +
      `AWS region, ${region}, and the ${nodeType} nodes are`;

    if (stdout.match(nodeType)) {
      console.log(`${msg} generally available:`);
      console.log(stdout);
      console.log("If you initialized the Edamame cluster with the optional --zones " +
        "flag, please double check that you specified at least one of the availability " +
        "zones shown in the table output above.");
      console.log("Otherwise, please try executing your load test again later, " +
        "as the required AWS instance types should become available again.");
    } else {
      console.log(`${msg} not generally available:`);
      console.log(stdout);
      console.log(`Please switch AWS regions or contact Edamame developers, so ` +
        `that we can extend Edamame's options for you region's specialized needs.`);
    }
  },

  async deleteEBSVolumes() {
    let volumesCommand = `aws ec2 describe-volumes --filter ` +
      `"Name=tag:kubernetes.io/created-for/pvc/name,Values=data-postgres-0,grafana-pvc"` +
      ` --query 'Volumes[].VolumeId' --output json`;

    let volumes = await exec(`${volumesCommand}`);
    volumes = JSON.parse(volumes.stdout);

    return Promise.allSettled(
      volumes.map((volume) => {
        exec(`aws ec2 delete-volume --volume-id ${volume}`);
      })
    );
  }
};

export default aws;
