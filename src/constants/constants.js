const NUM_VUS_PER_POD = 20000;
const POLL_FREQUENCY = 30000;
const DB_API_PORT = 4444;
const GRAF_PORT = 3000;
const DASHBOARD_PORT = 3001;
const PORT_FORWARD_DELAY = 3500;
const ARCHIVE = "edamame-load-tests";
const LOAD_GEN_NODE_TYPE = "m5.24xlarge";
const LOAD_AGG_NODE_TYPE = "m5zn.xlarge";
const DB_API_SERVICE = "db-api-service";
const DB_API_INGRESS_NAME = "ingress-db-api";
const EXTERNAL_IP_REGEX = "amazonaws.com";
const GRAF = "grafana.yaml";
const GRAF_DS_FILE = "grafana_datasource.yaml";
const GRAF_DB_FILE = "grafana_dashboards.yaml";
const GRAF_DS = "grafana-datasources";
const GRAF_DBS = "grafana-dashboards";
const GRAF_JSON_DBS = "grafana_json_dbs";
const K6_CR_TEMPLATE = "k6_custom_resource_template.yaml";
const K6_CR_FILE = "load_test_crds/k6_crd.yaml";
const PG_SECRET_FILE = "postgres_secret.yaml";
const PG_CM = "postgres-configmap";
const PG_CM_FILE = "postgres_configmap.yaml";
const PG_SS_FILE = "postgres_statefulset.yaml";
const STATSITE_FILE = "statsite_deployment.yaml";
const STATSITE_NODE_GRP = "ng-agg";
const GEN_NODE_GROUP_TEMPLATE = "load_gen_nodegroup_temp.yaml";
const AGG_NODE_GROUP_TEMPLATE = "load_agg_nodegroup_temp.yaml";
const GEN_NODE_GROUP_FILE = "load_test_crds/load_gen_nodegroup.yaml";
const AGG_NODE_GROUP_FILE = "load_test_crds/load_agg_nodegroup.yaml";
const SPECIALIZED_NODES_UNAVAILABLE_TIMEOUT = 480000;
const STATSITE_CM = "statsite-config";
const STATSITE_CM_FOLDER = "statsite-config";
const MIN_NUM_DASHES_FOR_GTEQ_2_AWS_AVZONES = 3;
const DISPLAY_TEST_TITLE_SPACES = 30;
const DISPLAY_TESTS_NUM_DASHES = 83;
const DB_API_FILE = "db_api_deployment.yaml";
const DB_API_ING_TEMPLATE = "db_api_ingress_template.yaml";
const DB_API_INGRESS = "db_api_ingress.yaml";
const CLUSTER_NAME = "edamame";
const LOAD_GEN_NODE_GRP = "ng-gen";
const K6_TEST_POD_REGEX = "k6-edamame-test-[0-9]{1,}";
const AWS_LBC_VERSION = "v2.4.1";
const AWS_LBC_CHART_VERSION = "1.4.1";
const AWS_LBC_IAM_POLNAME = "EdamameAWSLoadBalancerControllerIAMPolicy";
const EBS_CSI_DRIVER_REGEX =
  "ebs-csi-controller-sa.*AmazonEKS_EBS_CSI_DriverRole";
const AWS_LBC_CRD = `"github.com/aws/eks-charts/stable/aws-load-balancer-controller/crds?ref=master"`;
const AWS_LBC_POLICY_REGEX = `arn:aws:iam::.*EdamameAWSLoadBalancerControllerIAMPolicy`;
const DEFAULT_AWS_S3_STORAGE_CLASS = "STANDARD";
const VALID_STORAGE_CLASSES = {
  STANDARD: "Standard",
  REDUCED_REDUNDANCY: "Reduced Redundancy",
  STANDARD_IA: "Standard Infrequent Access",
  ONEZONE_IA: "One Zone Infrequent Access",
  INTELLIGENT_TIERING: "Standard Intelligent-Tiering",
  GLACIER: "Glacier Flexible Retrieval",
  DEEP_ARCHIVE: "Glacier Deep Archive",
  GLACIER_IR: "Glacier Instant Retrieval",
};
const RESTORE_BEFORE_IMPORT_S3_REGEX = `("ArchiveStatus": "(DEEP_ARCHIVE_ACCESS|ARCHIVE_ACCESS)"|"StorageClass": "(GLACIER|DEEP_ARCHIVE)")`;

export {
  NUM_VUS_PER_POD,
  POLL_FREQUENCY,
  PORT_FORWARD_DELAY,
  EXTERNAL_IP_REGEX,
  DB_API_SERVICE,
  DB_API_INGRESS,
  DB_API_ING_TEMPLATE,
  DB_API_INGRESS_NAME,
  ARCHIVE,
  PG_CM,
  GRAF,
  GRAF_DS,
  GRAF_DBS,
  GRAF_PORT,
  GRAF_DS_FILE,
  GRAF_DB_FILE,
  GRAF_JSON_DBS,
  DB_API_PORT,
  K6_CR_TEMPLATE,
  K6_CR_FILE,
  PG_SECRET_FILE,
  PG_CM_FILE,
  PG_SS_FILE,
  STATSITE_FILE,
  GEN_NODE_GROUP_TEMPLATE,
  AGG_NODE_GROUP_TEMPLATE,
  STATSITE_NODE_GRP,
  STATSITE_CM,
  STATSITE_CM_FOLDER,
  DISPLAY_TEST_TITLE_SPACES,
  DISPLAY_TESTS_NUM_DASHES,
  GEN_NODE_GROUP_FILE,
  AGG_NODE_GROUP_FILE,
  DB_API_FILE,
  CLUSTER_NAME,
  LOAD_GEN_NODE_GRP,
  K6_TEST_POD_REGEX,
  EBS_CSI_DRIVER_REGEX,
  AWS_LBC_CRD,
  AWS_LBC_VERSION,
  AWS_LBC_POLICY_REGEX,
  AWS_LBC_IAM_POLNAME,
  AWS_LBC_CHART_VERSION,
  MIN_NUM_DASHES_FOR_GTEQ_2_AWS_AVZONES,
  SPECIALIZED_NODES_UNAVAILABLE_TIMEOUT,
  RESTORE_BEFORE_IMPORT_S3_REGEX,
  DEFAULT_AWS_S3_STORAGE_CLASS,
  DASHBOARD_PORT,
  LOAD_GEN_NODE_TYPE,
  LOAD_AGG_NODE_TYPE,
  VALID_STORAGE_CLASSES,
};
