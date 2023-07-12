/**
  *@jest-environment jsdom
  */

import "@testing-library/jest-dom";
import React, { useState, useEffect } from 'react';
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import testService from "../services/testService";
import TestList from "../components/TestList";

jest.mock("axios");
const setCurrTestState = jest.fn();

describe('Test list rendering when there are tests', () => {
  beforeEach(async () => {
    const currTest = {
          "id": 2,
          "name": "test1Name",
          "start_time": "2023-04-18T18:55:14.179Z",
          "end_time": null,
          "status": "running",
          "script": "...stages: [\n{ target: 200, duration: ''120s'' },\n{ target: 0, duration: ''30s'' },\n..."
    };

    const tests = [
      {
        "id": 1,
        "name": "test2Name",
        "start_time": "2023-03-18T18:54:51.611Z",
        "end_time": "2023-03-18T18:56:59.596Z",
        "status": "completed",
        "script": "...test script content..."
      },
      currTest];
    
    jest
      .spyOn(testService , "getTests")
      .mockImplementation(jest.fn(() => Promise.resolve(tests)));

    await act(async () => {  
      render(<TestList 
        currTest={currTest} 
        setCurrTest={setCurrTestState} 
        />
      );
    });
  });

  it("Expect table of test information to render", async () => {
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.queryByText("test1Name")).toBeInTheDocument();
      expect(screen.queryByText("test2Name")).toBeInTheDocument();
      expect(screen.getByText(/Mar 18/)).toBeInTheDocument();
      expect(screen.getByText(/Apr 18/)).toBeInTheDocument();
      expect(screen.getByText(/2 mins/)).toBeInTheDocument();
    });
  });

  it("Expect launch a test button to be disabled because there is a current test", async () => {
    const button = screen.getByRole("button", {"name": "Launch a test"});
    expect(button).toHaveAttribute("disabled");
  });
});

describe('Test list rendering when there are no tests', () => {
  beforeEach(() => {
    const useEffectMock = jest.fn();
    jest
      .spyOn(React, "useEffect")
      .mockImplementation(useEffectMock);
    render(<TestList currTest={{}} setCurrTest={setCurrTestState} />);
  });

  it("Expect message about launching a test to render", () => {
    const msg = "Launch your first K6 load test. " +
      "Once launched, a list of your tests will appear below.";
    const p = screen.queryByText(msg);
    expect(p).toBeVisible();
  });

  it("Expect launch test button to be enabled", () => {
    const button = screen.getByRole("button", {"name": "Launch a test"});
    expect(button).toBeInTheDocument();	
    expect(button).not.toHaveAttribute("disabled");	
  });

  it("Expect launch test model to appear when user clicks on launch test button", async () => {
    const user = userEvent.setup();
    const button = screen.getByRole("button", {"name": "Launch a test"});
    await act(async () => {
      await user.click(button);
    });
    expect(screen.getByText(/Create Test/)).toBeInTheDocument();
    expect(screen.getByText(/Import a script/)).toBeInTheDocument();
    expect(screen.getByRole("button", {"name": "Cancel"})).toBeInTheDocument();
  });

  it("Expect table of test information not to be rendered", () => {
    const testTblCol1 = screen.queryByText("Name");
    const testTblCol2 = screen.queryByText("Date");
    const testTblCol3 = screen.queryByText("Total Time");
    const testTblCol4 = screen.queryByText("actions");

    expect(testTblCol1).toBeNull();
    expect(testTblCol2).toBeNull();
    expect(testTblCol3).toBeNull();
    expect(testTblCol4).toBeNull();
  });
});
