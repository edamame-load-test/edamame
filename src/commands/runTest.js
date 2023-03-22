import loadGenerators from "../utilities/loadGenerators.js";
import Spinner from "../utilities/spinner.js";
import cluster from "../utilities/cluster.js";
import manifest from "../utilities/manifest.js";
import dbApi from "../utilities/dbApi.js";

const runTest = async (options) => {
  const spinner = new Spinner("Reading test script...");
  const testPath = options.path;
  const name = options.name;

  try {
    const numVus = manifest.numVus(testPath);
    const nameExists = await dbApi.nameExists(name);

    if (numVus === 0) {
      throw new Error(`Either couldn't find k6 test script at path or the file specifies 0 total number of VUs.`);
    } else if (name && (name.length > 80 || !name.replace(/\s/g, '').length || nameExists)) {
      throw new Error(`Either test name already exists, consists of only whitespaces, or is over 80 characters long.`);
    }
    spinner.succeed(`Successfully read test script.`);

    const nodeCount = manifest.parallelism(numVus);
    spinner.info(`Initializing load test with ${nodeCount} ${nodeCount === 1 ? "node" : "nodes"}...`);
    spinner.start();
    const testId = await dbApi.newTestId(testPath, name);
    await cluster.launchK6Test(testPath, name, numVus, testId);
    spinner.succeed("Successfully initialized load test.");

    spinner.info("Running load test...");
    dbApi.updateTestStatus(testId, "running");
    spinner.start();
    await loadGenerators.pollUntilAllComplete(numVus);
    dbApi.updateTestStatus(testId, "completed");
    spinner.succeed("Load test completed.");

    spinner.info("Tearing down load generating resources.");
    spinner.start();
    await cluster.phaseOutK6();
    spinner.succeed("Successfully removed load generating resources from cluster.");
  } catch (err) {
    spinner.fail(`Error running test: ${err}`);
  }
};

export {
  runTest
};