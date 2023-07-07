/**
  *@jest-environment jsdom
  */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ScriptModal from "../components/ScriptModal";
jest.mock("axios");

// <ScriptModal setIsScriptModal={setIsScriptModal} currScript={currScript}/>

beforeEach(() => {
  const setStateMock = jest.fn();
  const currScript = "import http from ''k6/http'';\n" +
    " import { check } from ''k6'';\n\nexport let options = {\n  stages: [\n" + 
    " { target: 200, duration: ''120s'' },\n    { target: 0, duration: ''30s'' },\n" +
    "  ],\n};\n\nexport default function () {\n " +
    " const result = http.get(''https://test-api.k6.io/public/crocodiles/'');\n " +
    " check(result, {\n    ''http response status code is 200'': " +
    "result.status === 200,\n  });\n}";

  const currTest = {
    "id": 1,
    "name": "example",
    "start_time": "2023-07-18T18:55:14.179Z",
    "end_time": null,
    "status": "running",
    "script": currScript
  }; 
  render(
    <ScriptModal 
      setIsScriptModal={setStateMock} 
      currScript={currTest}
    />
  );
});

test("Expect selected load test name & script contents to render", () => {
  const h2 = screen.getByRole("heading", {"name": "example"});
  const scriptContent = screen.queryByText(/http response status code is/);
  expect(h2).toBeVisible();	
  expect(scriptContent).toBeVisible();	
});
  
test("Expect close button to render", () => {
  const button = screen.getByRole("button", {"name": "Close"});
  expect(button).toBeVisible();	
});
