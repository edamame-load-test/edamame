import { CLUSTER_NAME } from "./constants.js";

const iam = {
  OIDC: (
    `aws eks describe-cluster --name ${CLUSTER_NAME} ` +
    '--query "cluster.identity.oidc.issuer" ' +
    "--output text | cut -d '/' -f 5"
  ),

  listOIDCs: "aws iam list-open-id-connect-providers",

  createOIDC: (
    'eksctl utils associate-iam-oidc-provider ' +
    `--cluster ${CLUSTER_NAME} --approve`
  ),

  fetchRoles: `eksctl get iamserviceaccount --cluster ${CLUSTER_NAME}`,

  ebsCsiDriverRegex: "ebs-csi-controller-sa.*AmazonEKS_EBS_CSI_DriverRole",

  addIAMDriverRole: (
    'eksctl create iamserviceaccount ' + 
    '--name ebs-csi-controller-sa ' +
    '--namespace kube-system ' +
    `--cluster ${CLUSTER_NAME} ` +
    '--attach-policy-arn ' +
    'arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy ' +
    '--approve --role-only ' +
    '--role-name AmazonEKS_EBS_CSI_DriverRole'
  ),

  OIDCexists(stdout) {
    const oidcAndList = stdout.split("OpenIDConnectProviderList");
    const oidc = oidcAndList[0].split("\n")[0];
    const list = oidcAndList[1];
    return list.match(oidc) === null ? false : true;
  },

  addCsiDriver(roleArn) {
    return (
      'eksctl create addon ' +
      '--name aws-ebs-csi-driver ' +
      `--cluster ${CLUSTER_NAME} ` +
      `--service-account-role-arn ${roleArn} --force`
    );
  }
};

export default iam;
