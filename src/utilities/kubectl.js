import files from "./files.js";
import { promisify } from "util";
import child_process from "child_process";
import { spawn } from "child_process";
const exec = promisify(child_process.exec);
import { 
  AWS_LBC_CRD, 
  LOAD_GEN_NODE_GRP } 
from "../constants/constants.js";

const kubectl = {
  async existsOrError() {
    const msg = `Kubectl isn't installed. Please install it; ` +
    `instructions can be found at: ` +
    `https://kubernetes.io/docs/tasks/tools/`;

    try {
      await exec(`kubectl version --output=yaml`);
    } catch (err) {
      // need to check stdout b/c will throw error if kubectl is installed 
      //  but user is not currently connected to a cluster 
      if (!err.stdout.match("Version")) {
        throw new Error(msg);
      }
    }
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

  async pidPortForward(name) {
    const { stdout } = await exec(`ps aux | grep -i ${name} | grep -v grep | awk {'print $2'}`);
    return stdout;
  },

  async exactPodName(abbreviatedName) {
    const { stdout } = await this.getPods();
    const pods = stdout.split("\n");

    for (let i = 0; i < pods.length; i++) {
      const pod = pods[i];
      if (pod.match(abbreviatedName)) {
        const podDetails = pod.split(" ");
        return podDetails[0];
      }
    }
  },

  localPortAlreadyBound(port) {
    return exec(`lsof -iTCP:${port} -sTCP:LISTEN`);
  },

  async tempPortForward(podName, localAccessPort, podPort) {
    const options = {
      detached: true,
      stdio: "ignore",
      shell: true, // Use a shell to execute the command
    };

    const command = `kubectl port-forward ${podName} ${localAccessPort}:${podPort}`;
    let pid = await this.pidPortForward(podName);
  
    if (!pid) {
      const child = spawn(command, [], options);
      child.unref();
      return child;
    }
  },

  async checkPodAvailable(podNameRegex) {
    const { stdout } = await this.getPods();
    const pods = stdout.split("\n");

    for (let rowIdx = 0; rowIdx < pods.length; rowIdx++) {
      const pod = pods[rowIdx];

      if (pod.match(podNameRegex)) {
        const podDetails = pod.split(" ");

        for (let colIdx = 0; colIdx < podDetails.length; colIdx++) {
          const detail = podDetails[colIdx];
          if (detail && detail.match("Running")) {
            return true;
          }
        }
      }
    }
  },

  async endPortForward(name) {
    let pid = await this.pidPortForward(name);
    return exec(`kill ${pid}`);
  },

  async configMapExists(name) {
    const { stdout } = await exec(`kubectl get configmaps`);
    return !!stdout.match(name);
  },

  createConfigMap(path) {
    return exec(`kubectl create -f ${path}`);
  },

  deployHelmChartRepo() {
    return exec(
      `kubectl -n kube-system rollout status deployment aws-load-balancer-controller`
    );
  },

  getIngress(ingressName) {
    return exec(`kubectl get ingress/${ingressName}`);
  },

  deletePv(type, name) {
    return exec(`kubectl delete ${type} ${name}`);
  },

  getCrds() {
    return exec(`kubectl get customresourcedefinitions`);
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

  async getLoadNodes(nodeGroup) {
    const { stdout } = await exec(
      `kubectl get nodes --selector alpha.eksctl.io/nodegroup-name=${nodeGroup}`
    );
    const nodes = stdout
      .split("\n")
      .filter((line) => line !== "")
      .slice(1);
    return nodes;
  },

  async getLoadNodesCount(nodeGroup) {
    const nodes = await this.getLoadNodes(nodeGroup);
    return nodes.length;
  },

  async getLoadNodesReadyCount(nodeGroup) {
    const nodes = await this.getLoadNodes(nodeGroup);
    const readyNodes = nodes.filter((node) => node.match(/\sReady\s/));
    return readyNodes.length;
  },

  // If there's a process on a port, it kills it, otherwise it throws an error
  async stopProcessOnPort(port) {
    try {
      const { stdout } = await exec(
        `lsof -i :${port} | grep LISTEN | awk '{print $2}'`
      );
      const pid = stdout.trim();
      if (pid) {
        return exec(`kill ${pid}`);
      }
    } catch (err) {
      console.log(`Error stopping process on port ${port}: ${err.message}`);
    }
  },
};

export default kubectl;
