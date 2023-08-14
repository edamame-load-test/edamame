# Edamame

## Prerequisites

In order to execute a load test with the `edamame` command line interface or graphical user interface, you will need the following:

- An [AWS Account](https://docs.aws.amazon.com/SetUp/latest/UserGuide/setup-prereqs-instructions.html).
- The [AWS CLI tool](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) should be installed and configured.
- [`kubectl`](https://kubernetes.io/docs/tasks/tools/#kubectl), a command line tool for working with Kubernetes clusters, should be installed (ensure you have v. 1.14 or greater which supports Kustomization files).
- [`eksctl`](https://docs.aws.amazon.com/eks/latest/userguide/eksctl.html), a command line tool for working with EKS clusters, should be installed.
- [`Make`](https://www.gnu.org/software/make/), a build automation tool used to build executable programs and libraries from source code
- [`Go`](https://go.dev/doc/install),the programming language used by K6.
- [`Helm`](https://helm.sh/docs/intro/install/), a package manager for Kubernetes.

## Installation

- Clone the repository
- In the root directory, run the command `npm install` followed by the command `npm link`.

## Commands

### edamame init

Usage: `edamame init --zones <comma_separated_list_of_desired_availability_zones_in_your_preferred_aws_region>` <br />
Example: `edamame init --zones us-west-2a,us-west-2b,us-west-2d` <br />
Outputs:

```
[09:15:51:909] ℹ Creating Edamame cluster... (this may take up to 20 minutes)
[09:34:27:582] ✔ Successfully created Edamame cluster.
[09:34:27:583] ℹ Configuring EBS credentials...
[09:35:14:030] ✔ Successfully configured EBS credentials.
[09:35:14:030] ℹ Setting up AWS Load Balancer Controller...
[09:36:16:613] ✔ Set up AWS Load Balancer Controller.
[09:36:17:446] ℹ Deploying Grafana, Postgres, & K6 Operator...
[09:36:49:854] ✔ Cluster configured. Welcome to Edamame!
```

- Creates an EKS cluster using the associated AWS account (~15 mins)
- Configures the permissions and credentials needed to manage that cluster.
- Sets up the k6 operator that will manage the distributed load test
- Sets up the database
- Sets up Grafana, which will be used to visualize load test metrics.
- Provides an external link the user can use to access the Grafana dashboard via the browser.

**Notes**:

- It can take as long as _20 minutes_ to create the cluster and apply the necessary permissions.
- The --zones flag is optional and exists to provide greater configuration flexibility. You can create a cluster with the default availability zones in your preferred aws region by simply executing `edamame init`.
- To access the Grafana dashboards, use the provided link. For now, the default Grafana username and password are used (`admin` and `admin`). In Grafana, navigate to the Dashboards. From within the default HTTP & WebSockets dashboard, select the `test name` for the data you wish to view. If no tests have been run, you may see an error until there are test names in the database to display.

### edamame run

Usage: `edamame run --file {/path/to/test.js} --name "<desired name>" --vus-per-pod <num_vus>` <br />
Alternative usage:`edamame run -f {/path/to/test.js} -n "<desired name>" -v <num_vus>` <br />
Outputs:

```
[07:24:33:021] ℹ Initializing load test...
[07:24:33:027] ✔ Successfully initialized load test.
[07:24:33:027] ℹ Provisioning load test resources (2 generators)...
[07:25:11:079] ✔ Successfully provisioned load test resources.
[07:25:11:080] ℹ Running load test...
[07:28:12:527] ✔ Load test completed.
[07:28:12:527] ℹ Tearing down load generating resources.
[07:28:48:630] ✔ Successfully removed load generating resources from cluster.
```

- Automatically scales cluster nodes to handle the amount of VUs specified in the test file
- Runs the test
- Automatically removes load generating nodes and scales down the cluster once test is completed.

**Notes**:

- The name and vus-per-pod flags are optional. If you do not specify a name, a unique identifier will be generated for you and assigned to the test. If you do not specify a desired number of vus per pod, edamame will establish that amount for you.
- If your test name is one word, then you do not need to include quotes when executing this command. For example, if the test's name is `example`, then the command could be executed as: `edamame run --file {/relativepath/to/test.js} --name example`. If the test's name is `example test`, then the command would need to be executed as: `edamame run --file {/relativepath/to/test.js} --name "example test"`.
- The command takes the relative path of the test script you want to run. This should be written in JavaScript, and follow conventions of k6 testing scripts. See [here](https://k6.io/docs/examples/) for examples and tutorials on how to write a k6 test script.
- `edamame` will read the max number of VUs directly from the provided test script, there is no need to provide this as additional argument to `edamame run`. To see how to specify number of VUs in the test script, see the [k6 documentation](https://k6.io/docs/get-started/running-k6/#using-options).
- To run a sample test, use one of the sample test files provided in the `k6_tests` directory. For example, `./k6_tests/test1.js` (relative path specified from the root project directory).
- To see data displayed in real time, select an "auto-refresh" rate of `5s` in the Grafana dashboard, and select the `test name` of the currently running test.

### edamame stop

Usage: `edamame stop` <br />
Outputs:

```
[03:34:20:399] ℹ Stopping current test...
[03:34:53:785] ✔ Stopped current test.
```

- Immediately stops the currently running test
- Removes load generating nodes

### edamame get --all

Usage: `edamame get --all` <br />
Outputs:

```
[07:27:37:430] ℹ Retrieving information about historical tests...
[07:27:39:705] ✔ Successfully retrieved historical test data. Test names are listed under (index).
┌─────────────────┬────────────────────────────┬────────────────────────────┬─────────────┐
│     (index)     │         start time         │          end time          │   status    │
├─────────────────┼────────────────────────────┼────────────────────────────┼─────────────┤
│     example     │ '2023-03-20T23:20:03.744Z' │            null            │  'running'  │
│     50K VUs     │ '2023-03-20T22:52:48.864Z' │ '2023-03-20T22:55:04.873Z' │ 'completed' │
└─────────────────┴────────────────────────────┴────────────────────────────┴─────────────┘
```

- Retrieves information about tests and displays it in tabular format.

**Note**: The names of tests are shown under the (index) column. To view an individual test only or the contents of a test script, please run `edamame get --name "<test name>"`.

### edamame get --name

Usage: `edamame get --name "<test name>"` <br />
Alternative Usage: `edamame get -n "<test name>"` <br />
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

Usage: `edamame delete "<test name>"` <br />
Outputs:

```
[07:59:41:686] ℹ Deleting the test named: 'example'...
[07:59:42:850] ✔ Deleted the test named: 'example'
```

- Deletes all data associated with the test name from the database.

**Note**: If your test name is one word and doesn't contain spaces, then you don't need to include quotes when executing this command. The example output above resulted from executing `edamame delete example`. If your test name contains spaces, like `example test`, then you would execute this command using quotes like the following: `edamame delete "example test"`.

### edamame update

Usage: `edamame update --current "<current test name>" --new "<new proposed name>"` <br />
Alternative usage: `edamame update -c "<current test name>" -n "<new proposed name>"` <br />
Outputs:

```
[08:07:46:290] ℹ Updating test name from 'example test' to '50k VU test'...
[08:07:51:044] ✔ Successfully updated test's name to: '50k VU test'
```

- Updates a test name as long as the new proposed name is not already associated with a test.

**Note**: If either your current or proposed test name is one word and doesn't contain spaces, then you don't need to include quotes around that name when executing this command.

### edamame grafana --start

Usage: `edamame grafana --start` <br />
Outputs:

```
[07:31:01:842] ℹ Configuring local access to grafana dashboard...
[07:31:34:711] ✔ Please find your Grafana dashboard at: http://localhost:3000

```

- Provides secure local access to the Grafana dashboard.

### edamame grafana --stop

Usage: `edamame grafana --stop` <br />
Outputs:

```
[12:07:38:477] ℹ Stopping grafana
[12:07:38:774] ✔ Grafana dashboard has been removed
```

- Terminates secure local access to the Grafana dashboard and frees up port 3000 for other processes to run on it.

### edamame dashboard --start

Usage: `edamame dashboard --start` <br />
Outputs:

```
[12:00:32:022] ℹ Configuring local access to grafana dashboard...
[12:01:02:671] ✔ Please find your Grafana dashboard at: http://localhost:3000
[12:00:32:022] ℹ Initializing your dashboard
[12:01:02:671] ℹ Installed packages for your backend
[12:00:32:022] ℹ Installed packages for your frontend
[12:00:32:022] ℹ Generated frontend build
[12:01:02:671] ✔ Your dashboard is now running at http://localhost:3001
```

- Establishes local access to a graphical user interface (GUI) and the Grafana dashboard.
- The GUI provides an alternative interface relative to the CLI that a user can interact with. A user can use the GUI to:
  - Execute a load test
    - Specifically, the user can upload a test script and then start a test from within the GUI.
    - While the load test is being executed, the GUI will show updates about the duration and status of the test.
  - Review information about all load tests (current and historical)
  - Delete existing load test(s)
  - Delete all existing AWS infrastructure and associated data

### edamame dashboard --stop

Usage: `edamame dashboard --stop` <br />
Outputs:

```
[02:17:24:140] ℹ Stopping dashboard
[02:17:24:520] ✔ Dashboard has been removed
```

- Ends local access to the graphical user interface (GUI) and the Grafana dashboard.
- This frees up ports 3000 and 3001 for other processes.

### edamame archive

Usage: `edamame archive --all` <br />
Alternative Usage: `edamame archive --name testName --storage desiredStorageClass` <br />
Outputs:

`$ edamame archive --name "100K VUs"`

```
[04:08:56:294] ℹ Starting archive process...
[04:08:56:297] ℹ No S3 storage class has been specified, so the default STANDARD S3 storage class will be used.
[04:08:56:544] ℹ Creating load test AWS S3 Bucket located in: aws-region=us-west-2
 if it doesn't exist yet...
[04:09:01:715] ℹ AWS S3 Bucket is ready for uploads.
[04:09:03:366] ℹ Successfully archived 100K VUs.
[04:09:03:366] ✔ Archive process complete.
```

`$ edamame archive --all --storage INTELLIGENT_TIERING`

```
[01:57:28:276] ℹ Starting archive process...
[01:57:28:538] ℹ Creating load test AWS S3 Bucket located in: aws-region=us-west-2
 if it doesn't exist yet...
[01:57:30:170] ℹ AWS S3 Bucket is ready for uploads.
[01:57:33:187] ℹ Successfully archived 45f4d3e5-5c52-4f3e-88e2-17a085b1c80f.
[01:57:34:728] ℹ Archive for 100k VUs already exists. Skipping to next step.
[01:57:34:728] ✔ Archive process complete.
```

- Uploads 1 or more load tests to an AWS S3 Bucket as S3 objects with either the default STANDARD S3 storage class or the user's specified storage class. The bucket will be created in the same region that the user's AWS CLI is configured with.
- Purpose: allow user to back up their load test data to AWS S3 in case they need or want to teardown their Edamame EKS cluster, but want to persist their load test data beyond the life of the cluster. A user should execute this command prior to executing `edamame teardown`.
- A user can select any of the following valid storage class options:

  - STANDARD (Standard)
  - REDUCED_REDUNDANCY (Reduced Redundancy)
  - STANDARD_IA (Standard Infrequent Access)
  - ONEZONE_IA (One Zone Infrequent Access)
  - INTELLIGENT_TIERING (Standard Intelligent-Tiering)
  - GLACIER (Glacier Flexible Retrieval)
  - DEEP_ARCHIVE (Glacier Deep Archive)
  - GLACIER_IR (Glacier Instant Retrieval)

- The available storage options have different associated fees & availability SLAs. Some of the classes also have retrieval charges and minimum storage duration charges. Be sure to read more about the options at the following links to make sure you specify the right class for your storage needs.

  - https://aws.amazon.com/s3/storage-classes/
  - https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html

- There isn't currently support for changing the S3 object's storage class to another class via the Edamame CLI outside of restoring the object (see `edamame restore` for more details). If a user wants to change the storage class they can do so, but will need to use the AWS CLI or management console.

### edamame delete-from-archive

Usage: `edamame delete-from-archive --all` <br />
Alternative Usage: `edamame delete-from-archive --name "100K VUs"` <br />
Outputs:

```
[04:17:18:812] ℹ Starting archival deletion process...
[04:17:21:787] ✔ Successfully deleted 100K VUs from your Edamame load test AWS S3 Bucket.
```

- Permanently deletes 1 load test S3 object from the AWS S3 Bucket in case the user no longer wants to store that test's data.
- If the --all flag is provided then all S3 objects and the user's entire load test AWS S3 Bucket will be permanently deleted.

### edamame archive-contents

Usage: `edamame archive-contents` <br />
Outputs:

```
[11:59:14:955] ℹ Loading AWS S3 Bucket archive details...
[11:59:17:351] ✔ Your Edamame load test AWS S3 Bucket contains the following load test S3 objects:
 > 100kVUs.tar.gz
 > 120kVUs.tar.gz
```

- Shows the load tests that have been uploaded to AWS S3.
- Each S3 object contains the data associated with one historical test.

### edamame import-from-archive

Usage: `edamame import-from-archive --all` <br />
Alternative Usage: `edamame import-from-archive --name testName` <br />
Outputs:

`$ edamame import-from-archive --name "100K VUs"`

```
[02:29:28:602] ℹ Starting process to import AWS S3 archived data into Postgres database...
[02:29:31:507] ℹ Successfully imported the test 100kVUs from your AWS S3 Bucket.
[02:29:31:554] ✔ Completed importing data from AWS S3.
```

- Imports 1 or more load test S3 objects from the AWS S3 Bucket into the current AWS EKS cluster.
- If the --all flag is provided then all load test AWS S3 objects will be imported.
- If the import command is executed after a user executes load tests in their current cluster and there is an overlap in the import data and the data in the Postgres database in the cluster, then the import process will be aborted. There currently isn't support for importing data with a test that has the same name as a test that already exists in the Postgres database. As a result, it's recommended that a user executes `edamame import-from-archive` immediately after `edamame init` to avoid name collisions.

### edamame restore

Usage: `edamame restore --name testName --days 10` <br />
Outputs:

```
[02:25:18:043] ℹ Starting restoration of AWS S3 object...
[02:25:19:060] ✔ AWS S3 restoration process is in progress. Once it's complete you can import data associated with testName into your current Edamame EKS cluster or move the S3 object elsewhere.
```

- Restores an S3 object with the storage class GLACIER, DEEP_ARCHIVE, DEEP_ARCHIVE_ACCESS INTELLIGENT_TIERING, or ARCHIVE_ACCESS INTELLIGENT_TIERING to allow for importing the data associated with the specified load test that's stored in the S3 Object into the current Edamame EKS cluster or moving it to an alternative location.
- The number of days flag is required if the S3 object has the GLACIER or DEEP_ARCHIVE storage class. The argument passed to the number of days flag should be a number between 1 and 30 days.
- If the S3 object has the class GLACIER or DEEP_ARCHIVE then the object will be temporarily restored to the STANDARD class for the specified number of days. If the S3 object has the INTELLIGENT_TIERING class with an archive status of either DEEP_ARCHIVE_ACCESS or ARCHIVE_ACCESS, the object will be restored to the Frequent Access tier.
- Please note that restoration is not immediate and how long it takes is dependent on AWS. As a result, one cannot execute `edamame import-from-archive` immediately after executing `edamame restore`.

### edamame teardown

Usage: `edamame teardown` <br />
Outputs:

```
[07:58:47:060] ℹ Tearing Down Edamame Cluster...
[08:10:11:675] ✔ Deleted Edamame Cluster
```

- Removes database, Grafana, and k6 operator from EKS cluster.
- Deletes EKS cluster.
- Deletes associated EBS volumes requisitioned by EKS cluster.

**Notes**:

- Because this command will delete the entire cluster, it will also _delete all data_. In order to maintain historical data, the cluster must remain up.
- The process of deleting a cluster can take 10-15 mins.
- If you try to create a new cluster directly after deleting a cluster, you may run into errors. This is because AWS continues to remove resources associated with the EKS cluster for up to 10 minutes after the command completes. Try waiting for a little while before creating a new cluster, and see if that fixes the problem.
