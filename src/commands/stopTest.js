import Spinner from "../utilities/spinner.js";
import cluster from "../utilities/cluster.js";

import { KubeConfig, CustomObjectsApi } from '@kubernetes/client-node';

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(CustomObjectsApi);


const stopTest = async () => {
  const spinner = new Spinner("Stopping current test...");
  const res = await k8sApi.listClusterCustomObject("k6.io", "v1alpha1", "k6s");
  const tests = res.body.items;

  if (tests.length >= 1) {
    await cluster.phaseOutK6()
    spinner.succeed(`Stopped current test.`);
  } else {
    spinner.succeed(`No tests currently running.`);
  }
}

export {
  stopTest
};