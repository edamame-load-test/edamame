import files from "./files.js";
import iam from "./iam.js";
import { promisify } from "util";
import child_process from "child_process";
import {
  CLUSTER_NAME,
  LOAD_GEN_NODE_GRP,
  STATSITE_NODE_GRP,
  NODE_GROUPS_TEMPLATE,
  NODE_GROUPS_FILE,
  AWS_LBC_IAM_POLNAME,
} from "../constants/constants.js";
const exec = promisify(child_process.exec);

const eksctl = {
  async existsOrError() {
    try {
      await exec(`eksctl version`);
    } catch {
      const msg = `Eksctl isn't installed. Please install eksctl; ` +
      `instructions can be found at: ` +
      `https://docs.aws.amazon.com/eks/latest/userguide/eksctl.html`;
      throw new Error(msg);
    }
  },

  createCluster() {
    return exec(`eksctl create cluster --name ${CLUSTER_NAME} --version=1.25`);
  },

  clusterDesc() {
    return exec(`eksctl get cluster`);
  },

  async createNodeGroups() {
    const nodeGroupsData = files.readYAML(NODE_GROUPS_TEMPLATE);
    nodeGroupsData.metadata.region = await this.getRegion();

    if (!files.exists(files.path("/load_test_crds"))) {
      files.makeDir("/load_test_crds");
    }

    files.writeYAML(NODE_GROUPS_FILE, nodeGroupsData);

    return exec(
      `eksctl create nodegroup --config-file ${files.path(NODE_GROUPS_FILE)}`
    );
  },

  fetchIamRoles() {
    return exec(`eksctl get iamserviceaccount --cluster ${CLUSTER_NAME}`);
  },

  createOIDC() {
    return exec(
      "eksctl utils associate-iam-oidc-provider " +
        `--cluster ${CLUSTER_NAME} --approve`
    );
  },

  addIAMDriverRole() {
    return exec(
      "eksctl create iamserviceaccount " +
        "--name ebs-csi-controller-sa " +
        "--namespace kube-system " +
        `--cluster ${CLUSTER_NAME} ` +
        "--attach-policy-arn " +
        "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy " +
        "--approve --role-only " +
        "--role-name AmazonEKS_EBS_CSI_DriverRole"
    );
  },

  async createIamLBCPolicy(existingPol) {
    if (existingPol) {
      await this.deleteOldIamLBCPolicy(existingPol);
    }

    return this.newIamLBCPolicy();
  },

  localIp() {
    return exec(`curl ipinfo.io/ip`);
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

  deleteOldIamLBCPolicy(policy) {
    if (policy) {
      return exec(
        `aws iam delete-policy --policy-arn ${policy}`
      );
    }
  },

  createIamRoleLBCPol(policyArn) {
    return exec(
      "eksctl create iamserviceaccount " +
        "--name aws-load-balancer-controller " +
        `--cluster ${CLUSTER_NAME} ` +
        `--namespace kube-system ` +
        `--attach-policy-arn ${policyArn} ` +
        `--override-existing-serviceaccounts ` +
        "--approve"
    );
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

  addCsiDriver(roleArn) {
    return exec(
      "eksctl create addon " +
        "--name aws-ebs-csi-driver " +
        `--cluster ${CLUSTER_NAME} ` +
        `--service-account-role-arn ${roleArn} --force`
    );
  },

  scaleLoadGenNodes(numNodes) {
    return exec(
      `eksctl scale nodegroup --cluster=${CLUSTER_NAME} ` +
        `--nodes=${numNodes} ${LOAD_GEN_NODE_GRP}`
    );
  },

  scaleStatsiteNodes(numNodes) {
    return exec(
      `eksctl scale nodegroup --cluster=${CLUSTER_NAME} ` +
        `--nodes=${numNodes} ${STATSITE_NODE_GRP}`
    );
  },

  destroyCluster() {
    return exec(`eksctl delete cluster --name ${CLUSTER_NAME}`);
  },

  async getRegion() {
    const { stdout } = await exec(`eksctl get cluster --verbose 0`);
    const line = stdout.split("\n").find((line) => line.includes("edamame"));
    return line.split("\t")[1];
  },

  async deleteEBSVolumes() {
    let volumesCommand = `aws ec2 describe-volumes --filter ` +
      `"Name=tag:kubernetes.io/created-for/pvc/name,Values=data-psql-0,grafana-pvc"` +
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

export default eksctl;
