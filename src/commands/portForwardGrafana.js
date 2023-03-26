import Spinner from "../utilities/spinner.js";
import grafana from "../utilities/grafana.js";
import { GRAF_PORT } from "../constants/constants.js";
import kubectl from "../utilities/kubectl.js";

// Remove the "nothing exists log line"
const portForwardGrafana = () => {
  const spinner = new Spinner(
    "Configuring local access to grafana dashboard..."
  );
  grafana
    .getLocalAddressWhenReady()
    .then((message) => {
      message.match(`because port ${GRAF_PORT}`)
        ? spinner.fail(message)
        : spinner.succeed(`Please find your Grafana dashboard at: ${message}`);
    })
    .catch((err) => {
      console.log("nothing exists");
    });
};

const stopGrafana = async () => {
  const spinner = new Spinner("Stopping grafana");
  try {
    await kubectl.stopProcessOnPort(GRAF_PORT);
  } catch (err) {} // No need to throw an error. If grafana not running, just tell user it has been removed.
  spinner.succeed("Grafana dashboard has been removed");
};

export { portForwardGrafana, stopGrafana };
