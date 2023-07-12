import kubectl from "./kubectl.js";
import { POLL_FREQUENCY, GRAF_PORT } from "../constants/constants.js";

const grafana = {
  getLocalAddressWhenReady() {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        const available = await kubectl.checkPodAvailable("grafana");
        if (!available) {
          return;
        }
        clearInterval(interval);

        try {
          const { stdout } = await kubectl.localPortAlreadyBound(GRAF_PORT);
          if (stdout) {
            resolve(
              `Couldn't establish local grafana connection, because port ${GRAF_PORT} is already taken.`
            );
          }
        } catch {
          // localPortAlreadyBound within child_process fails if no process running at the port
          let podName = await kubectl.exactPodName("grafana");
          await kubectl.tempPortForward(podName, GRAF_PORT, GRAF_PORT);
          resolve(`http://localhost:${GRAF_PORT}`);
        }
      }, POLL_FREQUENCY);
    });
  },

  async detailedUrl() {
    return (
      `http://localhost:${GRAF_PORT}/d/IWSghv-5k/`+
      `http-ws-data?orgId=1&refresh=5s&var-testname`+
      `=yourSpecificTestName`
    );
  },
};

export default grafana;
