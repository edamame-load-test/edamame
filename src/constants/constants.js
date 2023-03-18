const NUM_VUS_PER_POD = 1000;
const POLL_FREQUENCY = 30000;
const DB_API_PORT = 4444;
const GRAF_PORT = 3000;
const PORT_FORWARD_DELAY = 5000;
const GRAF = "grafana.yaml";
const GRAF_DS_FILE = "grafana_datasource.yaml";
const GRAF_DB_FILE = "grafana_dashboards.yaml";
const GRAF_DS = "grafana-datasources";
const GRAF_DBS = "grafana-dashboards";
const GRAF_JSON_DBS = "grafana_json_dbs";
const K6_CR_TEMPLATE = "k6_custom_resource_template.yaml"
const K6_CR_FILE = 'load_test_crds/k6_crd.yaml';
const PG_SECRET_FILE = "postgres_secret.yaml";
const PG_CM = "psql-configmap";
const PG_CM_FILE = "postgres_configmap.yaml";
const PG_SS_FILE = "postgres_statefulset.yaml";
const STATSITE_FILE = "statsite_deployment.yaml";
const DB_API_FILE = "db_api_deployment.yaml";
const CLUSTER_NAME = "edamame";
const LOAD_GEN_NODE_GRP = "load-generators";
const K6_TEST_POD_REGEX = "k6-edamame-test-[0-9]{1,}";
const EBS_CSI_DRIVER_REGEX =
  "ebs-csi-controller-sa.*AmazonEKS_EBS_CSI_DriverRole";

export {
  NUM_VUS_PER_POD,
  POLL_FREQUENCY,
  PORT_FORWARD_DELAY,
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
  DB_API_FILE,
  CLUSTER_NAME,
  LOAD_GEN_NODE_GRP,
  K6_TEST_POD_REGEX,
  EBS_CSI_DRIVER_REGEX,
};
