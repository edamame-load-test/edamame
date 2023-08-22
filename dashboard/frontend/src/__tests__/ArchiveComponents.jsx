/**
  *@jest-environment jsdom
  */

import "@testing-library/jest-dom";
import { render, screen, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import ArchiveModal from "../components/ArchiveModal";
import testService from "../services/testService";

const name = "test1";
jest.mock("axios");

afterEach(cleanup);

describe('Archive Modal rendering when archiveExists is initial empty string b/c have not checked AWS S3 contents yet', () => {
  beforeAll(() => {
    render(<ArchiveModal archiveTestName={name} setIsArchiveModal={() => {}} />);
  });

  test("Expect archive modal display to show temporary message that archive content's is being checked for the test", () => {
    const heading = screen.getByRole("heading").innerHTML;
    expect(heading).toEqual(`Manage Your AWS S3 Archive`);
    expect(screen.getByText(/Checking to see if test1 already exists in the archive.../)).toBeVisible();
  });
});

describe('Archive Modal rendering when archiveExists is false b/c test does not exist in AWS S3', () => {
  beforeEach(() => {
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => React.useState(false));
    
    jest
      .spyOn(React, "useEffect")
      .mockImplementation(jest.fn());

    jest
      .spyOn(testService, "archiveExists")
      .mockImplementation(jest.fn(() => Promise.resolve(false)));
    
    jest
      .spyOn(testService, "archiveTest")
      .mockImplementation(jest.fn(() => Promise.resolve("")));
    render(<ArchiveModal archiveTestName={name} setIsArchiveModal={() => {}} />);
  });

  test("Expect archive modal display to show upload related heading and buttons", () => {
    const heading = screen.getByRole("heading").innerHTML;
    expect(heading).toEqual(`Archive ${name} in AWS S3`);
    const awsButton = screen.getByRole("button", {"name": "Read about S3 storage options"});
    expect(awsButton).toBeVisible();
    const cancelButton = screen.getByRole("button", {"name": "Cancel"});
    expect(cancelButton).toBeVisible();
    const archiveButton = screen.getByRole("button", {"name": "Archive test"});
    expect(archiveButton).toBeVisible();
  });


  test("Expect temporary highlight message and archive test button to be disabled after user clicks archive test", async () => {
    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByRole("button", {"name": "Archive test"}));
    });
    const deleteButton = screen.getByRole("button", {"name": "Archive test"});
    expect(deleteButton).toHaveAttribute("disabled");
    expect(screen.getByText(/upload/i)).toBeInTheDocument();
  });
});

describe('Archive Modal rendering when archiveExists is true b/c test exists in AWS S3', () => {
  beforeEach(() => {
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => React.useState(true));
  
    jest
      .spyOn(React, "useEffect")
      .mockImplementation(jest.fn());

    jest
      .spyOn(testService, "archiveExists")
      .mockImplementation(jest.fn(() => Promise.resolve(true)));
    render(<ArchiveModal archiveTestName={name} setIsArchiveModal={() => {}} />);
  });

  test("Expect archive modal display to show delete from archive heading and buttons", () => {
    const heading = screen.getByRole("heading").innerHTML;
    expect(heading).toEqual(`${name} Exists in AWS S3 Archive`);
    const cancelButton = screen.getByRole("button", {"name": "Cancel"});
    expect(cancelButton).toBeVisible();
    const archiveButton = screen.getByRole("button", {"name": "Delete test from archive"});
    expect(archiveButton).toBeVisible();
  });

  test("Expect temporary highlight message and delete button to be disabled after user clicks delete from archive", async () => {
    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByRole("button", {"name": "Delete test from archive"}));
    });
    const deleteButton = screen.getByRole("button", {"name": "Delete test from archive"});
    expect(deleteButton).toHaveAttribute("disabled");
    expect(screen.getByText(/from AWS S3/)).toBeInTheDocument();
  });
});
