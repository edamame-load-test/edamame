import { NUM_VUS_PER_POD, K6_CR_TEMPLATE, K6_CR_FINAL } from "./constants.js";
import { promisify } from "util";
import child_process from "child_process";
import fullPath from "./path.js";

const exec = promisify(child_process.exec);
const k6OpDeployPath = fullPath('../k6-operator/deployment');

const kubectl = {
  deployK6Operator() {
    return exec(`cd ${k6OpDeployPath} && cd .. && make deploy`);
  },

  deleteConfigMap(name) {
    return exec(`kubectl delete configmap ${name} -n default`);
  },

  createConfigMap(name, path) {
    return exec(`kubectl create configmap ${name} --from-file ${path}`);
  },

  deleteManifest(path) {
    return exec(`kubectl delete -f ${path}`);
  },

  applyManifest(path) {
    return exec(`kubectl apply -f ${path}`);
  },

  getPods() {
    return exec(`kubectl get pods`);
  }

};

export default kubectl;
