import Spinner from "../utilities/spinner.js";
import grafana from "../utilities/grafana.js";
import { GRAF_PORT } from "../constants/constants.js";

const portForwardGrafana = () => {
  const spinner = new Spinner("Configuring local access to grafana dashboard...");
  grafana
    .getLocalAddressWhenReady()
    .then(message => {
      message.match(`because port ${GRAF_PORT}`) ? 
        spinner.fail(message) :
        spinner.succeed(`Please find your Grafana dashboard at: ${message}`);
    })
    .catch((err) => {
      spinner.fail(`Error running test: ${err}`);
    });
};

export { portForwardGrafana };
