/**
  *@jest-environment jsdom
  */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { act } from 'react-dom/test-utils';
import Heading from "../components/Heading";
import userEvent from "@testing-library/user-event";
jest.mock("axios");

describe('Header rendering that is independent of whether or not there is a test running', () => {
  beforeEach(() => {
    const setCurrTestState = jest.fn();
    render(<Heading currTest={{}} setCurrTest={setCurrTestState} />);
  });

  it("Expect edamame logo to render", () => {
    const img = screen.getByRole("img", {"name": "Edamame Logo"});
    expect(img).toBeInTheDocument();	
  });

  it("Expect button and link to grafana page to load", () => {
    const button = screen.getByRole("button", {"name": "Learn to write tests using K6"});
    const link = screen.getByRole("link", {"name": "Learn to write tests using K6"});
    expect(button).toBeInTheDocument();	
    expect(link).toBeInTheDocument();	
  });
});

describe("Header rendering when there are no load tests currently running", () => {
  beforeEach(() => {
    const setCurrTestState = jest.fn();
    render(<Heading currTest={{}} setCurrTest={setCurrTestState} />);
  });

  it("Expect heading to have general welcome message if no load test is executing", () => {
    const h1 = screen.getByRole("heading", {"name": "Welcome to Edamame"});
    const introP = "Edamame is an open source, distributed load-testing tool. " +
      "You can upload a K6 test script, and then start a test to deploy a " +
      "distributed load test to your AWS account.";
    const p = screen.queryByText(introP);

    expect(h1).toBeInTheDocument();	
    expect(p).toBeInTheDocument();	
  });

  it("Expect stop button to be disabled because there is no test to stop", () => {
    const stopButton = screen.queryByText("Stop Test");
    expect(stopButton).toBeNull();
  });

});

describe('Header rendering when there is a load test currently running', () => {
  beforeEach(() => {
    const currentTest = {"id": 1,
      "name": "example",
      "start_time": "2023-07-18T18:55:14.179Z",
      "end_time": null,
      "status": "running",
      "script": "... test script stuff"
    };
    const setCurrTestState = jest.fn();
    render(<Heading currTest={currentTest} setCurrTest={setCurrTestState} />);
  });

  it("Expect heading to reflect current test's details instead of general welcome message", () => {
    const h1 = screen.getByRole("heading").innerHTML;
    expect(h1).toEqual(`Load test is running...`);

    const testMsgName = "example";
    expect(screen.getByText(testMsgName)).toBeVisible();
    expect(screen.getByText(/min/)).toBeVisible();
    expect(screen.getByText(/seconds/)).toBeVisible();
  });

  it("Expect stop button to be enabled and to update heading when clicked", async () => {
    const user = userEvent.setup();
    const button = screen.getByRole("button", {"name": "Stop Test"});
    expect(button).toBeInTheDocument();	
    await act(async () => {
      await user.click(button);
    });
    const h1 = screen.getByRole("heading").innerHTML;
    expect(h1).toEqual(`Load test is stopping...`);	
  });
});
