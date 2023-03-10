import cluster from "../utilities/cluster.js";
import ora from "ora";

const destroyEKSCluster = () => {
  const spinner = ora("Tearing Down Edamame Cluster...").start();
  cluster.destroy()
    .then(() => cli(spinner, "Deleted Edamame Cluster", "success"))
    .catch(err => cli(spinner, `Error deleting cluster: ${err}`, "fail"));
};

export {
  destroyEKSCluster
};
