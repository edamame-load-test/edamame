import kubectl from "./kubectl.js";
import { 
  POLL_FREQUENCY,
  EXTERNAL_IP_REGEX,
  GRAF_PORT
} from "../constants/constants.js";

const grafana = {
  checkIpAvailable() {
    return (
      kubectl.getIps()
        .then(({stdout}) => {
          const services = stdout.split("\n");

          for (let colIdx = 0; colIdx < services.length; colIdx++) {
            const serviceCols = services[colIdx];
      
            if (serviceCols.match("grafana")) {
              const propRows = serviceCols.split(" ");
      
              for (let rowIdx = 0; rowIdx < propRows.length; rowIdx++) {
                const prop = propRows[rowIdx];
                if (prop && prop.match(EXTERNAL_IP_REGEX)) {
                  return `${prop}:${GRAF_PORT}`;
                }
              }
            }
          }
        })
    );
  },

  getExternalIp() {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        const url = await this.checkIpAvailable();
        if (!url) {
          return;
        }

        clearInterval(interval);
        resolve(url);
      }, POLL_FREQUENCY);
    });
  }
};

export default grafana;
