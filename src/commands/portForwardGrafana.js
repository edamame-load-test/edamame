import Spinner from "../utilities/spinner.js";
import grafana from "../utilities/grafana.js";

const portForwardGrafana = () => {
  const spinner = new Spinner("Configuring local access to grafana dashboard...");
  grafana
    .getLocalAddressWhenReady()
    .then(url => {
      spinner.succeed(`Please find your Grafana dashboard at: ${url}`);
    })
    .catch((err) => {
      spinner.fail(`Error running test: ${err}`);
    });
};

export { portForwardGrafana };
