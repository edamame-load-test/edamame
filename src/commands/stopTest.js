import Spinner from "../utilities/spinner.js";
import cluster from "../utilities/cluster.js";
import manifest from "../utilities/manifest.js";
import dbApi from "../utilities/dbApi.js";
import { KubeConfig, CustomObjectsApi } from "@kubernetes/client-node";

const stopTest = async () => {
  const kc = new KubeConfig();
  kc.loadFromDefault();

  const k8sApi = kc.makeApiClient(CustomObjectsApi);

  const spinner = new Spinner("Stopping current test...");
  const res = await k8sApi.listClusterCustomObject("k6.io", "v1alpha1", "k6s");
  const tests = res.body.items;

  if (tests.length >= 1) {
    const testId = manifest.latestK6TestId();
    await cluster.phaseOutK6();
    dbApi.updateTestStatus(testId, "completed");
    // dbApi.putRequest(testId, { status: "completed"});
    spinner.succeed(`Stopped current test.`);
  } else {
    spinner.succeed(`No tests currently running.`);
  }
};

export { stopTest };
