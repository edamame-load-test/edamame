import loadGenerators from "../../../utilities/loadGenerators.js";
import kubectl from "../../../utilities/kubectl.js";

jest.mock("../../../utilities/kubectl.js", () => ({
  getPods: jest.fn(() => {
    return {
      stdout: `NAME          READY   STATUS    RESTARTS      AGE
        k6-edamame-test-12034  1/1     Completed   1 (90m ago)   90m
        k6-edamame-test-3023   1/1     Completed   0             90m
        k6-edamame-test-23403  1/1     Completed   0             90m`,
    };
  }),
}));

test("True is returned when all pods are completed and stdout is processed appropriately", async () => {
  const result = await loadGenerators.checkAllCompleted(3);
  expect(result).toEqual(true);
});

test("Falsey value is returned when the expected number of pods aren't shown as completed in stdout", async () => {
  const result = await loadGenerators.checkAllCompleted(4);
  expect(!!result).toEqual(false);
});
