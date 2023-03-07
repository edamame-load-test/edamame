import AWS from "aws-sdk";
import cdkApp from "../utilities/cdkApp.js";

AWS.config.update({ region: "us-west-1" }); // make this dynamic to user input later
const cloudformation = new AWS.CloudFormation();

const eksClusterDeployed = async () => {
  console.log("print AWS credentials");
  console.log("Access key:", AWS.config.credentials.accessKeyId); // will refect user's configured local credentials
  console.log("Region: ", AWS.config.region); // won't reflect user's local regional configuration

  const awsInfo = await cloudformation.describeStacks().promise();
  const cluster = awsInfo.Stacks.filter(stack => stack.StackName === "EdemameCdkStack");
  cluster.length > 0 ? console.log("created") : console.log("not created");
};

const deployEKSCluster = async () => {
  await cdkApp.deploy();
};

const destroyEKSCluster = async () => {
  // will need to add logic for user to confirm deletion/or figure out if there are flags to bypass that
  await cdkApp.destroy();
};

export {
  deployEKSCluster,
  destroyEKSCluster
};
