import kubectl from "../../../utilities/kubectl.js";

const exampleNodeDetails =
  "ip-#.us-west.compute.internal   Ready    <none>   79m   v#-#";
const grafanaConfigmap = "grafana-dashboards";

jest.mock("util", () => ({
  promisify: jest.fn(() => {
    return jest.fn().mockResolvedValue({
      stdout: `NAME STATUS ROLES AGE VERSION\n${exampleNodeDetails}\n${exampleNodeDetails}${grafanaConfigmap}`,
    });
  }),
}));

describe("Check logic that processes kubectl related cli commands' inputs and outputs", () => {
  test("Expect nodes to parsed accurately from kubectl command's stdout", async () => {
    const nodes = await kubectl.getLoadNodes("ng-agg");
    expect(nodes[0]).toMatch(exampleNodeDetails);
    expect(nodes[1]).toMatch(exampleNodeDetails);
    expect(nodes.length).toEqual(2);
  });

  test("Error isn't thrown if kubectl is installed", async () => {
    expect.assertions(0);
    try {
      await kubectl.existsOrError();
    } catch (error) {
      expect(error.message).toMatch(
        "Kubectl isn't installed. Please install it"
      );
    }
  });

  test("False is returned if specified configmap name isn't found in existing configmaps stdout", async () => {
    const result = await kubectl.configMapExists("statsite-config");
    expect(result).toEqual(false);
  });

  test("True is returned if specified configmap name is found in existing configmaps stdout", async () => {
    const result = await kubectl.configMapExists(grafanaConfigmap);
    expect(result).toEqual(true);
  });

  test("Expect 2 to be returned when parsing kubectl stdout that shows 2 ready nodes", async () => {
    const result = await kubectl.getLoadNodesReadyCount("ng-agg");
    expect(result).toEqual(2);
  });
});
