# Edamame

## Pre-requisites

In order to run `edamame`, you will need the following:

- An [AWS Account](https://docs.aws.amazon.com/SetUp/latest/UserGuide/setup-prereqs-instructions.html)
- The [AWS CLI tool](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) should be installed and configured.
- [`kubectl`](https://kubernetes.io/docs/tasks/tools/#kubectl), a command line tool for working with Kubernetes clusters, should be installed.
- [`eksctl`](https://docs.aws.amazon.com/eks/latest/userguide/eksctl.html), a command line tool for working with EKS clusters, should be installed.

## Installation

- Clone the repository
- In the root directory, run the command `npm install` followed by the command `npm link`.

## Commands

### edamame init

Usage: `edamame init`
Outputs:

```
⠋ Configuring EBS Credentials...Please enter a password to associate with your Edamame Grafana dashboard & Postgres database account.
Password: {password}
Password for PG & Grafana has been set as:
{password}
✔ Cluster configured. You can load test now!
```

- Creates an EKS cluster using the associated AWS account (~15 mins)
- Configures the permissions and credentials needed to manage that cluster.
- Sets up the operator that will manage the distributed load test
- Sets up the database
- Sets up Grafana, which will be used to visualize load test metrics.

**Note**: it can as long as *20 minutes* to create the cluster and apply the necessary permissions.

### edamame run

Usage: `edamame run --file {/path/to/test.js} --vus {max number of VUs in test run}`
Outputs:

```
⠇ Running k6 load test...Polling load generators...
⠧ Running k6 load test...Assessing load generators; counting the number completed
Number of load generators completed: 0
⠹ Running k6 load test...Polling load generators...
⠇ Running k6 load test...Assessing load generators; counting the number completed
Number of load generators completed: 0
⠴ Running k6 load test...Polling load generators...
⠹ Running k6 load test...Assessing load generators; counting the number completed
Number of load generators completed: 0
⠏ Running k6 load test...Polling load generators...
⠼ Running k6 load test...Assessing load generators; counting the number completed
Number of load generators completed: 0
⠸ Running k6 load test...Polling load generators...
⠏ Running k6 load test...Assessing load generators; counting the number completed
Number of load generators completed: 0
⠦ Running k6 load test...Polling load generators...
⠼ Running k6 load test...Assessing load generators; counting the number completed
Number of load generators completed: 4
✔ Removed load generating components from cluster.
```

- Automatically scales cluster nodes to handle the amount of VUs specified in the test file
- Runs the test
- Automatically deletes and scales down the cluster once test is completed.

**Notes**:

- The `--file` flag takes the relative path of the test script you want to run. This should be written in JavaScript, and follow conventions of k6 testing scripts. See [here](https://k6.io/docs/examples/) for examples and tutorials on how to write a k6 test script.
- The `--vus` flag is going to be removed soon, and `edamame` will read the max number of VUs directly from the provided test script.
- To run a sample test, use the sample test file provided in the `k6_tests` directory. From the project's root dir, the relative path will be `./k6_tests/test.js`

### edamame get

Usage: `edamame get`
Outputs:

```
✔ Retrieving all test ids...
[{"id":1},{"id":2},{"id":3}]
```

- Retrieves all the ids for tests that have been run in JSON format.

**Note**: In the future, the availability of this command may change. We'd like to have tests identifiable by some user-specified custom name.

### edamame teardown

Usage: `edamame teardown`
Outputs:

```
✔ Deleted Edamame Cluster
```

- Removes database, grafana, and operator from EKS cluster.
- Deletes EKS cluster.

**Notes**:

- Because this command will delete the entire cluster, it will also *delete all data*. In order to maintain historical data, the cluster must remain up. In the future, we will be providing an additional command to export data, so that it is not lost when the cluster is deleted.
- The process of deleting a cluster can take 10-15 mins.
- If you try to create a new cluster directly after deleting a cluster, you may run into errors. This is because AWS continues to remove resources associated with the EKS cluster for up to 10 minutes after the command completes. Try waiting for a little while, and seeing if that fixes the problem.
