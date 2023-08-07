import helm from "../../../utilities/helm.js";

jest.mock("util", () => ({
  promisify: jest.fn(() => {
    return jest.fn().mockResolvedValue({
      stdout: "",
    });
  }),
}));

test("Error is thrown if helm is installed", async () => {
  expect.assertions(1);
  try {
    await helm.existsOrError();
  } catch (error) {
    expect(error.message).toMatch("Helm isn't installed. Please install helm");
  }
});
