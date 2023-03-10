// num vus per job is arbitrary; update once know desired # 
const NUM_VUS_PER_POD = 50;
const K6_CR_TEMPLATE = "cr_template.yaml";
const K6_CR_FINAL = "cr_final.yaml";
const CLUSTER_NAME = "edamame";
const LOAD_GEN_NODE_GRP = "load-generators";
const K6_TEST_POD_REGEX = 'k6-edamame-test-[0-9]{1,}';
const EBS_CSI_DRIVER_REGEX = "ebs-csi-controller-sa.*AmazonEKS_EBS_CSI_DriverRole";

export {
  NUM_VUS_PER_POD,
  K6_CR_TEMPLATE,
  K6_CR_FINAL,
  CLUSTER_NAME,
  LOAD_GEN_NODE_GRP,
  K6_TEST_POD_REGEX,
  EBS_CSI_DRIVER_REGEX
};