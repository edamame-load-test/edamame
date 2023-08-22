/**
  *@jest-environment jsdom
  */

import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import testService from "../services/testService";
import Menu from "../components/Menu";

const tests = [{
  "id": 1,
  "name": "50k VUs",
  "start_time": "2023-03-18T18:54:51.611Z",
  "end_time": "2023-03-18T18:56:59.596Z",
  "status": "completed",
  "script": "...test script content..."
}];

const setState = jest.fn();

jest
  .spyOn(testService, "deleteTest")
  .mockImplementation(jest.fn(() => Promise.resolve("")));

beforeEach(() => {
  render(<Menu 
    test={tests[0]} 
    setMenu={setState}
    tests={tests}
    setTests={setState}
    setIsScriptModal={setState}
    setCurrScript={setState}
    setIsArchiveModal={setState}
    setArchiveTestName={setState} />);
});

test("Expect html tags for viewing script, archiving test, and deleting a test to render", () => {
  expect(screen.queryByText("See script")).toBeVisible();
  expect(screen.queryByText("Archive")).toBeVisible();
  expect(screen.queryByText("Delete")).toBeVisible();
});

test("Expect to call delete test action with current test name when delete is clicked", async () => {
  const user = userEvent.setup();
  await act(async () => {
    await user.click(screen.queryByText("Delete"));
  });
  expect(testService.deleteTest).toBeCalledWith(tests[0].name);
});
