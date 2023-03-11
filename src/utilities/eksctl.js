import { promisify } from "util";
import child_process from "child_process";
import { 
  CLUSTER_NAME, 
  LOAD_GEN_NODE_GRP 
} from "../constants/constants.js";
const exec = promisify(child_process.exec);

const eksctl = {
  createCluster() {
    return exec(`eksctl create cluster --name ${CLUSTER_NAME}`);
  },

  createLoadGenGrp() {
    return exec(
      `eksctl create nodegroup --cluster=${CLUSTER_NAME} `+ 
      `--name=${LOAD_GEN_NODE_GRP} --node-type=t3.small ` +
      `--nodes=0 --nodes-min=0 --nodes-max=100 `
    );
  },

  fetchIamRoles() {
    return exec(`eksctl get iamserviceaccount --cluster ${CLUSTER_NAME}`);
  },

  createOIDC() {
    return exec(
      'eksctl utils associate-iam-oidc-provider ' +
      `--cluster ${CLUSTER_NAME} --approve`
    );
  },

  addIAMDriverRole() {
    return exec('eksctl create iamserviceaccount ' + 
      '--name ebs-csi-controller-sa ' +
      '--namespace kube-system ' +
      `--cluster ${CLUSTER_NAME} ` +
      '--attach-policy-arn ' +
      'arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy ' +
      '--approve --role-only ' +
      '--role-name AmazonEKS_EBS_CSI_DriverRole'
    );
  },

  fetchOIDCs() {
    const OIDC = `aws eks describe-cluster ` +
    `--name ${CLUSTER_NAME} ` +
    '--query "cluster.identity.oidc.issuer" ' +
    "--output text | cut -d '/' -f 5"
    
    const listOIDCs = "aws iam list-open-id-connect-providers";

    return exec(`${OIDC} && ${listOIDCs}`);
  },

  addCsiDriver(roleArn) {
    return exec(
      'eksctl create addon ' +
      '--name aws-ebs-csi-driver ' +
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

  destroyCluster() {
    return exec(`eksctl delete cluster --name ${CLUSTER_NAME}`);
  }
};

export default eksctl;
