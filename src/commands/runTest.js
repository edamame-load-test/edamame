import loadGenerators from "../utilities/loadGenerators.js";
import Spinner from "../utilities/spinner.js";
import cluster from "../utilities/cluster.js";
import manifest from "../utilities/manifest.js";
import dbApi from "../utilities/dbApi.js";

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
    dbApi.updateTestStatus(testId, "running");
    await loadGenerators.pollUntilAllComplete(numNodes);
    dbApi.updateTestStatus(testId, "completed");
    spinner.succeed("Load test completed.");

    spinner.info("Tearing down load test resources.");
    spinner.start();
    await cluster.phaseOutK6();
    spinner.succeed("Successfully removed load test resources from cluster.");
  } catch (err) {
    spinner.fail(`Error running test: ${err}`);
  }
};

export { runTest };
