import Spinner from "../utilities/spinner.js";
import grafana from "../utilities/grafana.js";
import { GRAF_PORT } from "../constants/constants.js";
import kubectl from "../utilities/kubectl.js";

const portForwardGrafana = async () => {
  const spinner = new Spinner(
    "Configuring local access to grafana dashboard..."
  );

  try {
    let message = await grafana.getLocalAddressWhenReady();
    if (message.match(`because port ${GRAF_PORT}`)) {
      spinner.fail(message);
    } else {
      spinner.succeed(
        `You can access grafana at http://localhost:${GRAF_PORT}. ` +
        `If you want to navigate directly to Edamame's WebSocket and ` +
        `HTTP metrics dashboard, that's available at ${grafana.detailedUrl()}.` +
        `Simply replace the "yourSpecificTestName" query parameter ` +
        `with an existing historical test name.`
      );
    }
  } catch (err) {
    spinner.fail(
      `Error port forwardng to Grafana: ${err.message}`
    );
    if (err["stdout"]) console.log(err["stdout"]);
  }
};

const stopGrafana = async () => {
  const spinner = new Spinner("Stopping grafana");
  try {
    await kubectl.stopProcessOnPort(GRAF_PORT);
  } catch (err) {} // No need to throw an error. If grafana not running, just tell user it has been removed.
  spinner.succeed("Grafana dashboard has been removed");
};

export { portForwardGrafana, stopGrafana };
