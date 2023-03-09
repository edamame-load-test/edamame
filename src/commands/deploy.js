import cdkApp from "../utilities/cdkApp.js";
import eksctl from "../utilities/eksctl.js";

const deployEKSCluster = () => {
  eksctl.makeCluster();
};

export {
  deployEKSCluster
};
