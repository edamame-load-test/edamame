import aws from "../../../utilities/aws.js";
import archiver from "../../../utilities/archiver.js";
import dbApi from "../../../utilities/dbApi.js";
import archiveMessage from "../../../utilities/archiveMessage.js";

jest.mock("../../../utilities/dbApi.js", () => ({
  archive: jest.fn(() => {}),
  getTest: jest.fn(() => {
    return "";
  }),
  getAllTests: jest.fn(() => {
    return [];
  }),
}));

jest.mock("../../../utilities/aws.js", () => ({
  s3ObjectExists: jest.fn(() => {
    return `{
      "AcceptRanges": "bytes",
      "Restore": "ongoing-request=\"true\"",
      "ContentType": "application/x-tar",
      "Metadata": {},
      "StorageClass": "GLACIER"
    }`;
  }),
}));

const fakeSpinner = {
  info(message) {
    return message;
  },
};

test("Expect archive function not to be called when uploading to AWS if test has already been archived", async () => {
  await archiver.uploadToAWS("test1", fakeSpinner, "STANDARD");
  expect(dbApi.archive).not.toBeCalled();
});

test("Expect error to be thrown if user passes in test name to archive that doesn't exist", async () => {
  expect.assertions(1);
  try {
    await archiver.allTestsToArchive("fake test name");
  } catch (error) {
    expect(error.message).toMatch("Nonexistent test to archive");
  }
});

test("Expect error to be thrown if user tries to archive all tests when they haven't executed any load tests", async () => {
  expect.assertions(1);
  try {
    await archiver.allTestsToArchive();
  } catch (error) {
    expect(error.message).toMatch("There are no tests to archive");
  }
});

test("Expect STANDARD storage to be returned if no storage class is provided and storage is thus initially set as undefined", () => {
  const storage = archiver.validateStorageClass(undefined);
  expect(storage).toEqual("STANDARD");
});

test("Expect passed in storage class to be returned if it's one of the valid classes", () => {
  const validClass = "REDUCED_REDUNDANCY";
  const storage = archiver.validateStorageClass(validClass);
  expect(storage).toEqual(validClass);
});

test("Expect error to be thrown if invalid storage class is passed in", () => {
  expect.assertions(1);
  try {
    archiver.validateStorageClass("invalid class");
  } catch (error) {
    expect(error.message).toEqual(
      "Invalid AWS S3 storage class specified: invalid class"
    );
  }
});
