import cluster from "../../../utilities/cluster.js";
import aws from "../../../utilities/aws.js";
import iam from "../../../utilities/iam.js";
import eksctl from "../../../utilities/eksctl.js";
import files from "../../../utilities/files.js";
import kubectl from "../../../utilities/kubectl.js";
import manifest from "../../../utilities/manifest.js";
import { K6_CR_FILE } from "../../../constants/constants.js";
import loadGenerators from "../../../utilities/loadGenerators.js";
import dbApi from "../../../utilities/dbApi.js";

jest.mock("../../../utilities/files.js", () => ({
  delete: jest.fn(() => {}),
  path: jest.fn(() => {}),
}));

jest.mock("../../../utilities/dbApi.js", () => ({
  logUrl: jest.fn(() => {}),
}));

jest.mock("../../../utilities/iam.js", () => ({
  deleteAWSLbcPolArn: jest.fn(() => {}),
  ebsRole: jest.fn(() => {
    return "example role";
  }),
  OIDCexists: jest.fn(() => {
    return { stdout: "" };
  }),
}));

jest.mock("../../../utilities/eksctl.js", () => ({
  destroyCluster: jest.fn(() => {}),
  scaleNodes: jest.fn(() => {}),
  addCsiDriver: jest.fn(() => {}),
  addIAMDriverRole: jest.fn(() => {}),
  fetchIamRoles: jest.fn(() => {
    return { stdout: "" };
  }),
  createOIDC: jest.fn(() => {}),
}));

jest.mock("../../../utilities/manifest.js", () => ({
  forEachGrafJsonDB: jest.fn(() => {}),
  latestK6TestId: jest.fn(() => {
    return "1";
  }),
}));

jest.mock("../../../utilities/loadGenerators.js", () => ({
  pollUntilGenNodesScaleDown: jest.fn(() => {}),
}));

jest.mock("../../../utilities/kubectl.js", () => ({
  configMapExists: jest.fn(() => {
    return false;
  }),
  createConfigMap: jest.fn(() => {}),
  createConfigMapWithName: jest.fn(() => {}),
  deployK6Operator: jest.fn(() => {}),
  applyManifest: jest.fn(() => {}),
  deleteManifest: jest.fn(() => {}),
  deleteConfigMap: jest.fn(() => {}),
  getCrds: jest.fn(() => {
    return { stdout: "" };
  }),
  getPods: jest.fn(() => {
    return { stdout: "" };
  }),
}));

jest.mock("../../../utilities/aws.js", () => ({
  deleteOldIamLBCPolicy: jest.fn(() => {}),
  deleteEBSVolumes: jest.fn(() => {}),
  fetchOIDCs: jest.fn(() => {
    return { stdout: "" };
  }),
}));

test("Expect final node group files, IAM LBC policy, EBS Volumes, and cluster to all be deleted when destroy is called", async () => {
  await cluster.destroy();
  expect(aws.deleteOldIamLBCPolicy).toBeCalled();
  expect(aws.deleteEBSVolumes).toBeCalled();
  expect(iam.deleteAWSLbcPolArn).toBeCalled();
  expect(files.delete).toBeCalled();
  expect(eksctl.destroyCluster).toBeCalled();
});

test("Expect grafana manifests to be applied if grafana configmap doesn't exist yet", async () => {
  await cluster.applyGrafanaManifests();
  expect(kubectl.createConfigMapWithName).toHaveBeenCalledTimes(2);
  expect(kubectl.createConfigMapWithName).toHaveBeenCalledWith(
    "grafana-datasources",
    undefined
  );
  expect(manifest.forEachGrafJsonDB).toBeCalled();
  expect(kubectl.applyManifest).toBeCalled();
});

test("Expect statsite manifest to be applied if statsite configmap doesn't exist yet", async () => {
  await cluster.applyStatsiteManifests();
  expect(kubectl.createConfigMapWithName).toBeCalled();
});

test("Expect load aggregating and generating nodes, manifests, and k6 custom resource to be deleted when load test resources are torn down", async () => {
  await cluster.phaseOutK6();
  expect(manifest.latestK6TestId).toBeCalled();
  expect(kubectl.deleteManifest).toHaveBeenCalledTimes(2);
  expect(kubectl.deleteConfigMap).toBeCalled();
  expect(kubectl.deleteConfigMap).toHaveBeenCalledWith("1");
  expect(eksctl.scaleNodes).toHaveBeenCalledTimes(2);
  expect(loadGenerators.pollUntilGenNodesScaleDown).toBeCalled();
  expect(files.delete).toHaveBeenCalledWith(K6_CR_FILE);
});

test("Expect configmap and manifests to be applied when a k6 load test is launched", async () => {
  await cluster.launchK6Test("/some/path", 1);
  expect(kubectl.applyManifest).toHaveBeenCalledTimes(3);
  expect(kubectl.createConfigMapWithName).toBeCalled();
});

test("Expect oidc provider to be created if one doesn't exist for configuring EBS volumes", async () => {
  await cluster.configureEBSCreds();
  expect(eksctl.addIAMDriverRole).toBeCalled();
  expect(eksctl.fetchIamRoles).toBeCalled();
  expect(iam.ebsRole).toBeCalled();
  expect(eksctl.addCsiDriver).toBeCalled();
});
