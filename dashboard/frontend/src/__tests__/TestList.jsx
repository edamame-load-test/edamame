/**
  *@jest-environment jsdom
  */

import "@testing-library/jest-dom";
import React, { useState, useEffect } from 'react';
import { render, screen } from "@testing-library/react";
import TestList from "../components/TestList";

jest.mock("axios");

describe('Test list rendering when there are no tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const useEffectMock = jest.fn();
    jest.spyOn(React, "useEffect").mockImplementation(useEffectMock);
    const setCurrTestState = jest.fn();
    render(<TestList currTest={{}} setCurrTest={setCurrTestState} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
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