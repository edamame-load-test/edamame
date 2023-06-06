import cluster from "../utilities/cluster.js";
import Spinner from "../utilities/spinner.js";

const destroyEKSCluster = async () => {
  const spinner = new Spinner("Tearing Down Edamame Cluster...");

  try {
    await cluster.destroy();
    spinner.succeed("Deleted Edamame Cluster");
  } catch (err) {
    spinner.fail(`Error deleting cluster: ${err}`);
    if (err["stdout"]) console.log(err["stdout"]);
  }
};

export { destroyEKSCluster };
