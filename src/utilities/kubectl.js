import files from "./files.js";
import { promisify } from "util";
import child_process from "child_process";
const exec = promisify(child_process.exec);

const kubectl = {
  deployK6Operator() {
    const path = files.path("", "../k6-operator");
    return exec(`cd ${path} && make deploy`);
  },

  deleteConfigMap(name) {
    return exec(`kubectl delete configmap ${name} -n default`);
  },

  createConfigMapWithName(name, path) {
    return exec(`kubectl create configmap ${name} --from-file ${path}`);
  },

  createSecret() {
    return exec(`kubectl apply -k ${files.path("")}`);
  },

  deleteManifest(path) {
    return exec(`kubectl delete -f ${path}`);
  },

  getIps() {
    return exec(`kubectl get svc`);
  },

  configMapExists(name) {
    return (
      exec(`kubectl get configmaps`)
        .then(({stdout}) => {
          return !!stdout.match(name);
        })
    );
  },

  portForward(service, port1, port2) {
    return exec(`kubectl port-forward ${service} ${port1}:${port2} & `);
  }, 

  createConfigMap(path) {
    // added this b/c psql-host key wasn't being properly registered by db api
    // deployment even though could see psql-host in psql-configmap when used
    // createConfigMapWithName to create psql configmap
    return exec(`kubectl create -f ${path}`);
  },

  deletePv(type, name) {
    return exec(`kubectl delete ${type} ${name}`);
  },

  getPv(type, name) {
    return exec(`kubectl get ${type} ${name}`);
  },

  applyManifest(path) {
    return exec(`kubectl apply -f ${path}`);
  },

  getPods() {
    return exec(`kubectl get pods`);
  }
};

export default kubectl;

