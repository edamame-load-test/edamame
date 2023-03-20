import * as k8s from '@kubernetes/client-node';
import * as net from 'net';

import app from "./app.js";

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const forward = new k8s.PortForward(kc);
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const server = net.createServer(async (socket) => {
  const response = await k8sApi.listNamespacedPod('default');
  const pods = response.body.items;
  const dbApiPod = pods.find(pod => pod.metadata.name.includes("db-api"));

  forward.portForward('default', dbApiPod.metadata.name, [4444], socket, null, socket);
});

export default server;

