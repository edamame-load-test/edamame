import kubectl from "./kubectl.js";
import { 
  POLL_FREQUENCY,
  GRAF_PORT
} from "../constants/constants.js";

const grafana = {
  getLocalAddressWhenReady() {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        const available = await kubectl.checkPodAvailable("grafana");
        if (!available) {
          return;
        }
        clearInterval(interval);

        kubectl
          .exactPodName("grafana")
          .then(podName => {
            kubectl.tempPortForward(podName, GRAF_PORT, GRAF_PORT)
          });
        
        resolve(`http://localhost:${GRAF_PORT}`);
      }, POLL_FREQUENCY);
    });
  },

  detailedUrl(testId) {
    kubectl
      .exactPodName("grafana")
      .then(podName => {
        kubectl.tempPortForward(podName, GRAF_PORT, GRAF_PORT);
      });
  
    return (
      `http://localhost:${GRAF_PORT}/d/IWSghv-4k/` +
      `http-data?orgId=1&var-testid=${testId}` +
      `&refresh=5s&from=now-15m&to=now`
    );
  }
};

export default grafana;
