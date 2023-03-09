// num vus per job is arbitrary; update once know desired # 
const NUM_VUS_PER_JOB = 50;
const K6_CR_TEMPLATE = "cr_template.yaml";
const K6_CR_FINAL = "cr_final.yaml";
const CLUSTER_NAME = "edamame";

export {
  NUM_VUS_PER_JOB,
  K6_CR_TEMPLATE,
  K6_CR_FINAL,
  CLUSTER_NAME
}