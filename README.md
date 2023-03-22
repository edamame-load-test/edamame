# Edamame

## Prerequisites

In order to run `edamame`, you will need the following:

- An [AWS Account](https://docs.aws.amazon.com/SetUp/latest/UserGuide/setup-prereqs-instructions.html).
- The [AWS CLI tool](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) should be installed and configured.
- [`kubectl`](https://kubernetes.io/docs/tasks/tools/#kubectl), a command line tool for working with Kubernetes clusters, should be installed (ensure you have v. 1.14 or greater which supports Kustomization files).
- [`eksctl`](https://docs.aws.amazon.com/eks/latest/userguide/eksctl.html), a command line tool for working with EKS clusters, should be installed.
- [`Make`](https://www.gnu.org/software/make/), a build automation tool used to build executable programs and libraries from source code
- [`Go`](https://go.dev/doc/install),the programming language used by K6.

## Installation

- Clone the repository
- In the root directory, run the command `npm install` followed by the command `npm link`.

## Commands

### edamame init

Usage: `edamame init`
Outputs:

```
[06:57:41:533] ℹ Creating Edamame cluster... (this may take up to 20 minutes)
[07:17:37:273] ✔ Successfully created Edamame cluster.
[07:17:37:273] ℹ Configuring EBS credentials...
[07:18:17:884] ✔ Successfully configured EBS credentials.
Please enter a password to associate with your Edamame Grafana dashboard & Postgres database account.
Password: {password}
Password for PG & Grafana has been set as:
{password}
[07:18:23:735] ℹ Deploying Grafana, Postgres, & K6 Operator...
[07:19:13:287] ℹ Please find your Grafana dashboard at: a0423fc7c84b24a7696178bc915f9fb0-1778855885.us-west-2.elb.amazonaws.com:3000
[07:19:13:287] ✔ Cluster configured. Welcome to Edamame!
```

- Creates an EKS cluster using the associated AWS account (~15 mins)
- Configures the permissions and credentials needed to manage that cluster.
- Sets up the k6 operator that will manage the distributed load test
- Sets up the database
- Sets up Grafana, which will be used to visualize load test metrics.
- Provides an external link the user can use to access the Grafana dashboard via the browser.

**Notes**:

- It can as long as _20 minutes_ to create the cluster and apply the necessary permissions.
- To access the Grafana dashboards, use the provided link. For now, the default Grafana username and password are used (`admin` and `admin`). In Grafana, navigate to the Dashboards, and select the `testid` for the data you wish to view. If no tests have been run, you may see an error, until there are test ids in the database to display.

### edamame run

Usage: `edamame run --path {/path/to/test.js} --name "<desired name>"`
Alternative usage:`edamame run -p {/path/to/test.js} -n "<desired name>"`
Outputs:

```
[07:24:33:021] ℹ Reading test script...
[07:24:33:027] ✔ Successfully read test script.
[07:24:33:027] ℹ Initializing load test with 3 nodes...
[07:25:11:079] ✔ Successfully initialized load test.
[07:25:11:080] ℹ Running load test...
[07:28:12:527] ✔ Load test completed.
[07:28:12:527] ℹ Tearing down load generating resources.
[07:28:48:630] ✔ Successfully removed load generating resources from cluster.
```

- Automatically scales cluster nodes to handle the amount of VUs specified in the test file
- Runs the test
- Automatically removes load generating nodes and scales down the cluster once test is completed.

**Notes**:

- The name flag is optional. If you do not specify a name, a unique identifier will be generated for you and assigned to the test.
- If your test name is one word, then you do not need to include quotes when executing this command. For example, if the test's name is `example`, then the command could be executed as: `edamame run --path {/relativepath/to/test.js} --name example`. If the test's name is `example test`, then the command would need to be executed as: `edamame run --path {/relativepath/to/test.js} --name "example test"`.
- The command takes the relative path of the test script you want to run. This should be written in JavaScript, and follow conventions of k6 testing scripts. See [here](https://k6.io/docs/examples/) for examples and tutorials on how to write a k6 test script.
- `edamame` will read the max number of VUs directly from the provided test script, there is no need to provide this as additional argument to `edamame run`. To see how to specify number of VUs in the test script, see the [k6 documentation](https://k6.io/docs/get-started/running-k6/#using-options).
- To run a sample test, use one of the sample test files provided in the `k6_tests` directory. For example, `./k6_tests/test1.js` (relative path specified from the root project directory).
- To see data displayed in real time, select an "auto-refresh" rate of `5s` in the Grafana dashboard, and select the `testid` for the currently running test.

### edamame stop

Usage: `edamame stop`
Outputs:

```
[03:34:20:399] ℹ Stopping current test...
[03:34:53:785] ✔ Stopped current test.
```

- Immediately stops the currently running test
- Removes load generating nodes

### edamame get --all

Usage: `edamame get --all`
Outputs:

```
[07:27:37:430] ℹ Retrieving information about historical tests...
[07:27:39:705] ✔ Successfully retrieved historical test data. Test names are listed under (index).
┌─────────────────┬────────────────────────────┬────────────────────────────┬─────────────┐
│     (index)     │         start time         │          end time          │   status    │
├─────────────────┼────────────────────────────┼────────────────────────────┼─────────────┤
│     example     │ '2023-03-20T23:20:03.744Z' │            null            │  'running'  │
│      50K VUs    │ '2023-03-20T22:52:48.864Z' │ '2023-03-20T22:55:04.873Z' │ 'completed' │
└─────────────────┴────────────────────────────┴────────────────────────────┴─────────────┘
```

- Retrieves information about tests and displays it in tabular format.

**Note**: The names of tests are shown under the (index) column. To view an individual test only or the contents of a test script, please run `edamame get --name "<test name>"`.

### edamame get --name

Usage: `edamame get --name "<test name>"`
Alternative Usage: `edamame get -n "<test name>"`
Outputs:

```
[06:33:08:621] ℹ Retrieving details about the test named: 'example'...
[06:33:09:554] ✔ Successfully retrieved data about the test named: 'example.'
┌─────────┬────────────────────────────┬────────────────────────────┬─────────────┐
│ (index) │         start time         │          end time          │   status    │
├─────────┼────────────────────────────┼────────────────────────────┼─────────────┤
│ example │ '2023-03-20T22:52:48.864Z' │ '2023-03-20T22:55:04.873Z' │ 'completed' │
└─────────┴────────────────────────────┴────────────────────────────┴─────────────┘
                               Test script content:
-----------------------------------------------------------------------------------
"import http from ''k6/http'';
import { check } from ''k6'';

export const options = {
  scenarios: {
    shared_iter_scenario: {
      executor: \"shared-iterations\",
      vus: 10,
      iterations: 100,
      startTime: \"0s\",
    },
    per_vu_scenario: {
      executor: \"per-vu-iterations\",
      vus: 20,
      iterations: 10,
      startTime: \"10s\",
    },
  },
};

export default function () {
  const result = http.get(''https://test-api.k6.io/public/crocodiles/'');
  check(result, {
    ''http response status code is 200'': result.status === 200,
  });
}

"
```

- Shows the full k6 load test script associated with a given test name.

**Note**: Please specify the test name in double quotes when executing this command if the test name includes spaces. For example, if the test name is `example test`, then this command would be executed as: `edamame get -n "example test"`. If your test name is one word or is hyphenated, then you can exclude the quotes.

### edamame delete

Usage: `edamame delete "<test name>"`
Outputs:

```
[07:59:41:686] ℹ Deleting the test named: 'example'...
[07:59:42:850] ✔ Deleted the test named: 'example'
```

- Deletes all data associated with the test name from the database.

**Note**: If your test name is one word and doesn't contain spaces, then you don't need to include quotes when executing this command. The example output above resulted from executing `edamame delete example`. If your test name contains spaces, like `example test`, then you would execute this command using quotes like the following: `edamame delete "example test"`.

### edamame update

Usage: `edamame update --current "<current test name>" --new "<new proposed name>"`
Alternative usage: `edamame update -c "<current test name>" -n "<new proposed name>"`
Outputs:

```
[08:07:46:290] ℹ Updating test name from 'example test' to '50k VU test'...
[08:07:51:044] ✔ Successfully updated test's name to: '50k VU test'
```

- Updates a test name as long as the new proposed name is not already associated with a test.

**Note**: If either your current or proposed test name is one word and doesn't contain spaces, then you don't need to include quotes around that name when executing this command.

### edamame grafana

Usage: `edamame grafana`
Outputs:

```
[07:31:01:842] ℹ Configuring local access to grafana dashboard...
[07:31:34:711] ✔ Please find your Grafana dashboard at: http://localhost:3000

```

- Provides local access to the grafana dashboard.

**Note**: If you enter `CTRL+C` in the terminal after running edamame grafana, that will end your local access to the dashboard. To run a test while maintaining access to the grafana dashboard, please open a new terminal and execute `edamame run {/path/to/test.js}`

### edamame teardown

Usage: `edamame teardown`
Outputs:

```
[07:58:47:060] ℹ Tearing Down Edamame Cluster...
[08:10:11:675] ✔ Deleted Edamame Cluster
```

- Removes database, Grafana, and k6 operator from EKS cluster.
- Deletes EKS cluster.
- Deletes associated EBS volumes requisitioned by EKS cluster.

**Notes**:

- Because this command will delete the entire cluster, it will also _delete all data_. In order to maintain historical data, the cluster must remain up. In the future, we will be providing an additional command to export data, so that it is not lost when the cluster is deleted.
- The process of deleting a cluster can take 10-15 mins.
- If you try to create a new cluster directly after deleting a cluster, you may run into errors. This is because AWS continues to remove resources associated with the EKS cluster for up to 10 minutes after the command completes. Try waiting for a little while, and seeing if that fixes the problem.
