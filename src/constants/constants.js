// num vus per job is arbitrary; update once know desired # 
const NUM_VUS_PER_POD = 50;
const POLL_FREQUENCY = 30000;
const DB_API_PORT = 4444;
const DB_API_NAME = "db-api-service";
const DB_API_REGEX = "amazonaws.com";
const K6_CR_FILE = "k6_custom_resource.yaml";
const PG_SECRET_FILE = "postgres_secret.yaml";
const PG_CM_FILE = "postgres_configmap.yaml";
const PG_SS_FILE = "postgres_statefulset.yaml";
const STATSITE_FILE = "statsite_deployment.yaml";
const DB_API_FILE = "db_api_deployment.yaml";
const CLUSTER_NAME = "edamame";
const LOAD_GEN_NODE_GRP = "load-generators";
const K6_TEST_POD_REGEX = 'k6-edamame-test-[0-9]{1,}';
const EBS_CSI_DRIVER_REGEX = "ebs-csi-controller-sa.*AmazonEKS_EBS_CSI_DriverRole";


export {
  NUM_VUS_PER_POD,
  POLL_FREQUENCY,
  DB_API_PORT,
  DB_API_NAME,
  DB_API_REGEX,
  K6_CR_FILE,
  PG_SECRET_FILE,
  PG_CM_FILE,
  PG_SS_FILE,
  STATSITE_FILE,
  DB_API_FILE,
  CLUSTER_NAME,
  LOAD_GEN_NODE_GRP,
  K6_TEST_POD_REGEX,
  EBS_CSI_DRIVER_REGEX
};