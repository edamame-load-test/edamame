import eksctl from "../../../utilities/eksctl.js";
import aws from "../../../utilities/aws.js";

jest.mock("../../../utilities/aws.js", () => ({
  throwErrorIfInvalidZone: jest.fn(() => {}),
}));

jest.mock("util", () => ({
  promisify: jest.fn(() => {
    return jest.fn().mockResolvedValue({
      stdout: `
        NAME	REGION		EKSCTL CREATED\n
        edamame	us-west-2	True
      `,
    });
  }),
}));

test("Error is not thrown when eksctl is installed", async () => {
  expect.assertions(0);
  try {
    await eksctl.existsOrError();
  } catch (error) {
    expect(error.message).toMatch(
      "Eksctl isn't installed. Please install eksctl;"
    );
  }
});

test("Region is parsed accurately from eksctl command's get cluster info stdout", async () => {
  const region = await eksctl.getRegion();
  expect(region).toBe("us-west-2");
});

test("Expect availability zone validation function to not be called if user provides a list of zones", async () => {
  await eksctl.createCluster();
  expect(aws.throwErrorIfInvalidZone).not.toBeCalled();
});

test("Expect availability zone validation function to be called if user provides a list of zones", async () => {
  const zones = "us-west-2a,us-west-2b";
  await eksctl.createCluster(zones);
  expect(aws.throwErrorIfInvalidZone).toHaveBeenCalledWith(zones);
});
