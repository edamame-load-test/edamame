import eksctl from "../utilities/eksctl.js";

const destroyEKSCluster = () => {
  eksctl.destroyCluster();
};

export {
  destroyEKSCluster
};
