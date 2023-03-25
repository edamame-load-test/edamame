import { promisify } from "util";
import child_process from "child_process";
import { 
  CLUSTER_NAME,
  AWS_LBC_VERSION,
  AWS_LBC_CHART_VERSION
} from "../constants/constants.js";
const exec = promisify(child_process.exec);

const helm = {
  existsOrError() {
    return (
      exec(`helm version`)
        .then(({stdout}) => {
          if (!stdout) {
            const msg = `Helm isn't installed. Please install helm; ` +
            `instructions can be found at: https://helm.sh/docs/intro/install/`;
            throw new Error(msg);
          }
        })
    );
  },

  addEKSRepo() {
    return exec(`helm repo add eks https://aws.github.io/eks-charts`);
  },

  installAWSLBC() {
    return exec(
      `helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
      --set clusterName=${CLUSTER_NAME} \
      --set serviceAccount.create=false \
      --set serviceAccount.name=aws-load-balancer-controller \
      -n kube-system`
    );
  }
};

export default helm;
