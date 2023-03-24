import files from "./files.js";
import { promisify } from "util";
import child_process from "child_process";
const exec = promisify(child_process.exec);
import {
  AWS_LBC_CRD,
  LOAD_GEN_NODE_GRP
} from "../constants/constants.js";

const kubectl = {
  existsOrError() {
    const msg = `Kubectl isn't installed. Please install it; ` +
      `instructions can be found at: ` +
      `https://kubernetes.io/docs/tasks/tools/`;

    return (
      exec(`kubectl version --output=yaml`)
        .then(({ stdout }) => {
          if (!stdout) {
            throw new Error(msg);
          }
        })
        .catch(({ stdout }) => {
          // will throw error if not currently connected to a cluster
          if (!stdout.match("Version")) {
            throw new Error(msg);
          }
        })
    );
  },

  applyAwsLbcCrd() {
    return exec(`kubectl apply -k ${AWS_LBC_CRD}`);
  },

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

  pidPortForward(name) {
    return (
      exec(`ps aux | grep -i ${name} | grep -v grep | awk {'print $2'}`)
        .then(({ stdout }) => {
          return stdout;
        })
    );
  },

  exactPodName(abbreviatedName) {
    return (
      this.getPods()
        .then(({ stdout }) => {
          const pods = stdout.split("\n");

          for (let i = 0; i < pods.length; i++) {
            const pod = pods[i];
            if (pod.match(abbreviatedName)) {
              const podDetails = pod.split(" ");
              return podDetails[0];
            }
          }
        })
    );
  },

  localPortAlreadyBound(port) {
    return exec(`lsof -iTCP:${port} -sTCP:LISTEN`);
  },

  tempPortForward(podName, localAccessPort, podPort) {
    this.pidPortForward(podName)
      .then(pid => {
        if (!pid) {
          return exec(`kubectl port-forward ${podName} ${localAccessPort}:${podPort} &`);
        }
      });
  },

  checkPodAvailable(podNameRegex) {
    return (
      this.getPods()
        .then(({ stdout }) => {
          const pods = stdout.split("\n");

          for (let rowIdx = 0; rowIdx < pods.length; rowIdx++) {
            const pod = pods[rowIdx];

            if (pod.match(podNameRegex)) {
              const podDetails = pod.split(" ");

              for (let colIdx = 0; colIdx < podDetails.length; colIdx++) {
                const detail = podDetails[colIdx];
                if (detail && detail.match('Running')) {
                  return true;
                }
              }
            }
          }
        })
    );
  },

  endPortForward(name) {
    return (
      this.pidPortForward(name)
        .then(pid => exec(`kill ${pid}`))
    );
  },


  configMapExists(name) {
    return (
      exec(`kubectl get configmaps`)
        .then(({ stdout }) => {
          return !!stdout.match(name);
        })
    );
  },

  createConfigMap(path) {
    // added this b/c psql-host key wasn't being properly registered by db api
    // deployment even though could see psql-host in psql-configmap when used
    // createConfigMapWithName to create psql configmap
    return exec(`kubectl create -f ${path}`);
  },

  deployHelmChartRepo() {
    return exec(`kubectl -n kube-system rollout status deployment aws-load-balancer-controller`);
  },

  getIngress(ingressName) {
    return exec(`kubectl get ingress/${ingressName}`);
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
  },

  async getGeneratorNodes() {
    const { stdout } = await exec(`kubectl get nodes --selector alpha.eksctl.io/nodegroup-name=ng-gen`);
    const nodes = stdout.split("\n").filter(line => line !== '').slice(1);
    return nodes;
  },

  async getGeneratorNodesCount() {
    const nodes = await this.getGeneratorNodes();
    return nodes.length;
  },

  async getGeneratorNodesReadyCount() {
    const nodes = await this.getGeneratorNodes();
    const readyNodes = nodes.filter(node => node.match(/\sReady\s/));
    return readyNodes.length;
  }
};

export default kubectl;
