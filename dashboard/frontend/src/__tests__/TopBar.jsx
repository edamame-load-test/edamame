/**
  *@jest-environment jsdom
  */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import TopBar from "../components/TopBar";
import { act } from 'react-dom/test-utils';
  
beforeEach(() => {
  const useEffectMock = jest.fn();
  jest.spyOn(React, "useEffect").mockImplementation(useEffectMock);

  act(() => {
    render(<TopBar />);
  });
});
  
test("Expect button with link to AWS to render", () => {
  const link = screen.getByRole("link", {"name": "See on AWS"});
  expect(link).toBeVisible();	
  const button = screen.getByRole("link", {"name": "See on AWS"});
  expect(link).toBeVisible();	
});

test("Expect success message to render", () => {
  const msg = screen.queryByText("Success! Your EKS cluster is running on your AWS account.");
  expect(msg).toBeVisible();	
});

test("Expect delete cluster button to be enabled", async () => {
  const button = screen.getByRole("button", {"name": "Delete Cluster"});
  expect(button).toBeVisible();	
});
