#!/usr/bin/env node

import { init } from "./commands/init.js";
import { destroyEKSCluster } from "./commands/destroy.js";
import { runTest } from "./commands/runTest.js";
import { get } from "./commands/get.js";
import { updateTestName } from "./commands/updateTestName.js";
import { deleteTest } from "./commands/deleteTest.js";
import {
  portForwardGrafana,
  stopGrafana,
} from "./commands/portForwardGrafana.js";
import { stopTest } from "./commands/stopTest.js";
import { NUM_VUS_PER_POD } from "./constants/constants.js";
import { Command } from "commander";
import { startGui, stopGui } from "./commands/gui.js";
import { archive } from "./commands/archive.js";
import { deleteFromArchive } from "./commands/deleteFromArchive.js";
import { importFromArchive } from "./commands/importFromArchive.js";
import { showArchiveContents } from "./commands/archiveContents.js";
import { restore } from "./commands/restore.js";
import { ARCHIVE } from "./constants/constants.js";

const program = new Command();

program
  .command("init")
  .option(
    "-z, --zones <zones>",
    "List of one or more desired cluster availability zones specific to a user's preferred aws region"
  )
  .description(
    "Create an EKS cluster and deploy Grafana, Postgres, & K6 Operator"
  )
  .action(init);

program
  .command("run")
  .requiredOption("-f, --file <file>", "File path of k6 load test script")
  .option("-n, --name <name>", "Name to associate with test")
  .option(
    "-v, --vus-per-pod <vus>",
    "Specify the maximum number of VUs per pod",
    NUM_VUS_PER_POD
  )
  .description("run the load test")
  .action(runTest);

program
  .command("get")
  .option("--all", "Get all information")
  .option("-n, --name <name>", "Name of specific test")
  .description("get information about all or one historical test(s)")
  .action(get);

program
  .command("delete <name>")
  .description("delete a test and associated metrics from the database")
  .action(deleteTest);

program
  .command("update")
  .requiredOption("-c, --current <current>", "Current test name")
  .requiredOption("-n, --new <new>", "New test name")
  .description("Update the name associated with a test")
  .action(updateTestName);

program
  .command("grafana")
  .option("--start", "Start Grafana")
  .option("--stop", "Stop Grafana")
  .description(
    "configure local access to grafana dashboard to analyze test metrics"
  )
  .action((options) => {
    if (options.start) {
      portForwardGrafana();
    } else if (options.stop) {
      stopGrafana();
    }
  });

program
  .command("stop")
  .description("stop a running test")
  .action(() => {
    stopTest();
  });

program
  .command("dashboard")
  .option("--start", "Start Dashboard")
  .option("--stop", "Stop Dashboard (leave grafana running)")
  .description("Spin up grafana, and the express app serving react")
  .action(async (options) => {
    if (options.start) {
      await portForwardGrafana();
      startGui();
    } else if (options.stop) {
      stopGui();
    }
  });

program
  .command("teardown")
  .description("Delete the entire EKS cluster")
  .action(() => {
    destroyEKSCluster();
  });

program
  .command("archive")
  .option(
    "--all",
    `Upload all load tests as S3 Objects to the ${ARCHIVE} AWS S3 Bucket`
  )
  .option("-n, --name <name>", "Name of specific test to archive")
  .option(
    "-s, --storage <storage>",
    "Desired storage class for the AWS S3 Object"
  )
  .description(
    `Move load test data from EBS volume to AWS S3 Bucket to allow for persistent test ` +
      ` data storage beyond the life of the Edamame EKS cluster. If test name flag isn't ` +
      ` provided, then all existing test data will be archived. If the storage flag isn't ` +
      ` provided, then the default STANDARD storage class will be used.`
  )
  .action(archive);

program
  .command("delete-from-archive")
  .option("--all", `Delete entire ${ARCHIVE} AWS S3 Bucket`)
  .option(
    "-n, --name <name>",
    "Name of specific test to remove from the AWS S3 Bucket"
  )
  .description(
    `Delete specific load test from the ${ARCHIVE} AWS S3 Bucket or delete the entire bucket`
  )
  .action(deleteFromArchive);

program
  .command("import-from-archive")
  .option("--all", `Import all data stored in the ${ARCHIVE} AWS S3 Bucket`)
  .option(
    "-n, --name <name>",
    "Name of specific test to import from the AWS S3 Bucket"
  )
  .description(
    `Imports historical load test data stored in ${ARCHIVE} AWS S3 Bucket to the Postgres database`
  )
  .action(importFromArchive);

program
  .command("restore")
  .requiredOption("-n, --name <name>", "Name of specific test to restore")
  .option("-d, --days <days>", "Number of days to restore the AWS S3 Object")
  .description(
    `Restores AWS S3 object associated with a given load test to the STANDARD storage class for the specified # of days`
  )
  .action(restore);

program
  .command("archive-contents")
  .description(
    `List the names of the historical load tests that exist in the AWS S3 Bucket`
  )
  .action(showArchiveContents);

program.parse(process.argv);
