import files from "../utilities/files.js";
import dbApi from "../utilities/dbApi.js";
import Spinner from "../utilities/spinner.js";
import cluster from "../utilities/cluster.js";
import manifest from "../utilities/manifest.js";
import loadGenerators from "../utilities/loadGenerators.js";

const runTest = async (options) => {
  const spinner = new Spinner("Initializing load test...");
  const testPath = options.file;
  const name = options.name;
  const vusPerPod = options.vusPerPod;

  try {
    const numVus = manifest.numVus(testPath);
    const nameExists = await dbApi.nameExists(name);
    if (numVus === 0) {
      throw new Error(
        `Either couldn't find k6 test script at path or the file specifies 0 total number of VUs.`
      );
    } else if (
      name &&
      (name.length > 80 || !name.replace(/\s/g, "").length || nameExists)
    ) {
      throw new Error(
        `Either test name already exists, consists of only whitespaces, or is over 80 characters long.`
      );
    }
    
    if (files.exists(files.path("testIsRunning.txt"))) {
      throw new Error(
        `A load test is already in progress. You may only execute one test at a time.`
      );
    }

    files.write("testIsRunning.txt", "");
    const testId = await dbApi.newTestId(testPath, name);
    spinner.succeed("Successfully initialized load test.");

    const numNodes = manifest.parallelism(numVus, vusPerPod);
    spinner.info(
      `Provisioning load test resources (${numNodes} generator${
        numNodes === 1 ? "" : "s"
      })...`
    );
    spinner.start();
    await cluster.provisionStatsiteNode();
    await cluster.provisionGenNodes(numNodes);
    spinner.succeed(`Successfully provisioned load test resources.`);

    spinner.info("Running load test...");
    spinner.start();
    await cluster.launchK6Test(testPath, testId, numNodes);
    await dbApi.updateTestStatus(testId, "running");
    await loadGenerators.pollUntilAllComplete(numNodes);
    await dbApi.updateTestStatus(testId, "completed");
    spinner.succeed("Load test completed.");

    spinner.info("Tearing down load test resources.");
    spinner.start();
    await cluster.phaseOutK6();
    spinner.succeed("Successfully removed load test resources from cluster.");
    files.delete("testIsRunning.txt");
  } catch (err) {
    spinner.fail(`Error running test: ${err}`);
    if (err["stdout"]) console.log(err["stdout"]);
    if (!err.message.match(`load test is already in progress.`)) {
      files.delete("testIsRunning.txt");
    }
    
    if (err.message.match("getaddrinfo ENOTFOUND k8s-default-ingressd")) {
      console.log("The DNS is still being configured for the DB API. Please try re-executing a load test in a couple minutes");
    }
  }
};

export { runTest };
