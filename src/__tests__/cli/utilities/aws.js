import aws from "../../../utilities/aws.js";

const fakeAccountNum = "10000000001";
const avZoneA = "us-west-2a";
const avZoneB = "us-west-2b";
const avZoneC = "us-west-2c";

const invalidUserAVZoneInput =
  `When specifying >1 availability zones, please ` +
  `specify the desired zones as a comma separated list` +
  ` like so: "us-east-1a,us-east-1b"`;

const generatorNode = "m5.24xlarge";
const aggregatorNode = "m5zn.large";
const nodeOfferingsInRegion = `
  +-----------------------------------------------------+
  ||               InstanceTypeOfferings               ||
  |+--------------+--------------+---------------------+|
  || InstanceType |  Location    |    LocationType     ||
  |+--------------+--------------+---------------------+|
  ||  m5zn.large  |  us-west-2a  |  availability-zone  ||
  ||  m5zn.large  |  us-west-2c  |  availability-zone  ||
  ||  m5zn.large  |  us-west-2b  |  availability-zone  ||
  |+--------------+--------------+---------------------+|
`;

jest.mock("util", () => ({
  promisify: jest.fn(() => {
    return jest.fn().mockResolvedValue({
      stdout: `{
          "UserId": fakeUserId,
          "Account": "${fakeAccountNum}",
          "Arn": arn:aws:iam::someNumber:someRole,
        },
        {
          "ZoneName": ${avZoneA},
          ...
          "ZoneName": ${avZoneB},
          ...
          "ZoneName": ${avZoneC},
        }`,
    });
  }),
}));

jest.mock("../../../utilities/dbApi.js", () => ({}));

describe("Check logic that processes aws cli commands' inputs and outputs", () => {
  test("Account id number should be extracted from aws sts get-caller-identity stdout", async () => {
    await expect(aws.getAccountId()).resolves.toMatch(fakeAccountNum);
  });

  test("Availability zones are parsed accurately from stdout and set as object keys", async () => {
    const zones = await aws.usersPossibleZones();
    expect(zones).toHaveProperty(avZoneA);
    expect(zones).toHaveProperty(avZoneB);
    expect(zones).toHaveProperty(avZoneC);
  });

  test("Spaces are removed from test name & compressed file extension is added when deriving s3 upload name", () => {
    const testName = "100k VUs";
    expect(aws.s3ObjectNameForTest(testName)).toEqual("100kVUs.tar.gz");
  });

  test("True is returned when checking for existing AWS S3 Bucket", async () => {
    await expect(aws.archiveBucketExists()).resolves.toEqual(true);
  });

  test("Error is thrown when user doesn't list their desired availability zones in expected list format", () => {
    expect.assertions(1);
    try {
      aws.checkForInvalidZoneList("us-west-2aus-west-2b");
    } catch (error) {
      expect(error.message).toEqual(invalidUserAVZoneInput);
    }
  });

  test("Error is thrown when user doesn't specify availability zone names that align with AWS naming conventions", () => {
    expect.assertions(1);
    try {
      aws.checkForInvalidZoneList("uswest2a");
    } catch (error) {
      expect(error.message).toEqual(invalidUserAVZoneInput);
    }
  });

  test("Expect returned message to indicate availability of node type in region when AWS CLI stdout reflects the specified node", () => {
    const message = aws.nodeTypeAvailableMsg(
      nodeOfferingsInRegion,
      aggregatorNode
    );
    expect(message).toMatch("generally available");
  });

  test("Expect returned message to indicate no availability of node type in region when AWS CLI stdout doesn't reflect the specified node", () => {
    const message = aws.nodeTypeAvailableMsg(
      nodeOfferingsInRegion,
      generatorNode
    );
    expect(message).toMatch("not generally available");
  });
});
