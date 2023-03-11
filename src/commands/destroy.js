import cluster from "../utilities/cluster.js";
import Spinner from "../utilities/spinner.js";

const destroyEKSCluster = () => {
  const spinner = new Spinner("Tearing Down Edamame Cluster...");
  cluster.destroy()
    .then(() => spinner.succeed("Deleted Edamame Cluster"))
    .catch(err => spinner.fail(`Error deleting cluster: ${err}`));
};

export {
  destroyEKSCluster
};
