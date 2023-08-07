import iam from "../../../utilities/iam.js";
import files from "../../../utilities/files.js";

jest.mock("../../../utilities/files.js", () => ({
  write: jest.fn(() => {}),
}));

const fakeId = "1000000100";
const csiDriver = "arn:aws:iam::SOME_ACCOUNT:role/AmazonEKS_EBS_CSI_DriverRole";
const iamRoleStdout = `NAMESPACE	NAME  ROLE ARN\nebs-csi-controller-sa\t${csiDriver}`;

const validOidcList = `SOME_NUMBER\n OpenIDConnectProviderList: [{ "Arn": "arn:aws:iam::SOME_ACCOUNT:oidc-provider/id/SOME_NUMBER" }]`;
const invalidOidcList = `SOME_NUMBER OpenIDConnectProviderList: [{ "Arn": "arn:aws:iam::SOME_ACCOUNT:oidc-provider/id/SOME_OTHER_NUMBER" }]`;

describe("Check logic that processes iam related cli commands' inputs and outputs", () => {
  test("Undefined is returned if eksctl stdout doesn't match EBS CSI driver", () => {
    expect(iam.ebsRole("")).toEqual(undefined);
  });

  test("EBS CSI driver string role is returned if eksctl stdout matches expected role syntax", () => {
    expect(iam.ebsRole(iamRoleStdout)).toEqual(csiDriver);
  });

  test("Expect file to be written when logging AWS lbc policy arn from stdout", () => {
    iam.logAWSLbcPolArn("some policy info");
    expect(files.write).toBeCalled();
  });

  test("Expect true to be returned when stdout shows existing OIDC provider arn", () => {
    const exists = iam.OIDCexists(validOidcList);
    expect(exists).toEqual(true);
  });

  test("Expect false to be returned when stdout doesn't show existing OIDC provider arn", () => {
    const exists = iam.OIDCexists(invalidOidcList);
    expect(exists).toEqual(false);
  });
});
