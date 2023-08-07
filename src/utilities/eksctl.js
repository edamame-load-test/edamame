import aws from "./aws.js";
import files from "./files.js";
import manifest from "./manifest.js";
import { promisify } from "util";
import child_process from "child_process";
import {
  CLUSTER_NAME,
  GEN_NODE_GROUP_FILE,
  GEN_NODE_GROUP_TEMPLATE,
  AGG_NODE_GROUP_TEMPLATE,
  LOAD_GEN_NODE_GRP,
  STATSITE_NODE_GRP,
} from "../constants/constants.js";
const exec = promisify(child_process.exec);

const eksctl = {
  async existsOrError() {
    try {
      await exec(`eksctl version`);
    } catch {
      const msg =
        `Eksctl isn't installed. Please install eksctl; ` +
        `instructions can be found at: ` +
        `https://docs.aws.amazon.com/eks/latest/userguide/eksctl.html`;
      throw new Error(msg);
    }
  },

  async createCluster(zones) {
    let command = `eksctl create cluster --name ${CLUSTER_NAME} --version=1.25`;
    if (!zones) {
      return exec(command);
    }

    await aws.throwErrorIfInvalidZone(zones);
    command += ` --zones ${zones}`;
    return exec(command);
  },

  clusterDesc() {
    return exec(`eksctl get cluster`);
  },

  async createNodeGroup(finalFile, useBackUpNodeType = false) {
    let type;
    let template;

    if (finalFile === GEN_NODE_GROUP_FILE) {
      type = LOAD_GEN_NODE_GRP;
      template = GEN_NODE_GROUP_TEMPLATE;
    } else {
      type = STATSITE_NODE_GRP;
      template = AGG_NODE_GROUP_TEMPLATE;
    }
    await manifest.createNodeGroupCr(
      type,
      finalFile,
      template,
      useBackUpNodeType
    );
    return exec(
      `eksctl create nodegroup --config-file ${files.path(finalFile)}`
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

  localIp() {
    return exec(`curl ipinfo.io/ip`);
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

  addCsiDriver(roleArn) {
    return exec(
      "eksctl create addon " +
        "--name aws-ebs-csi-driver " +
        `--cluster ${CLUSTER_NAME} ` +
        `--service-account-role-arn ${roleArn} --force`
    );
  },

  scaleNodes(numNodes, nodeGroupName) {
    return exec(
      `eksctl scale nodegroup --cluster=${CLUSTER_NAME} ` +
        `--nodes=${numNodes} ${nodeGroupName}`
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
};

export default eksctl;
