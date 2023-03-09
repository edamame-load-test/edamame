import cdkApp from "../utilities/cdkApp.js";
import eksctl from "../utilities/eksctl.js";

const deployEKSCluster = async () => {
  //await cdkApp.deploy();
  eksctl.makeCluster();
};

export {
  deployEKSCluster
};
