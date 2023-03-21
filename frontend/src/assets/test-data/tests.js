const tests = [
  {
    id: 12,
    name: "test1",
    date: "2022-03-18T18:55:14.179Z",
    start_time: "2023-03-18T18:55:14.179Z",
    end_time: "2023-03-18T19:01:05.214Z",
    status: "completed",
    script:
      "import http from ''k6/http'';\nimport { check } from ''k6'';\n\nexport let options = {\n  stages: [\n    { target: 200, duration: ''120s'' },\n    { target: 0, duration: ''30s'' },\n  ],\n};\n\nexport default function () {\n  const result = http.get(''https://test-api.k6.io/public/crocodiles/'');\n  check(result, {\n    ''http response status code is 200'': result.status === 200,\n  });\n}",
  },
  {
    id: 11,
    name: "First Test",
    start_time: "2023-03-18T18:54:51.611Z",
    end_time: "2023-03-18T18:56:59.596Z",
    status: "completed",
    script:
      "import http from ''k6/http'';\nimport { check } from ''k6'';\n\nexport let options = {\n  stages: [\n    { target: 200, duration: ''120s'' },\n    { target: 0, duration: ''30s'' },\n  ],\n};\n\nexport default function () {\n  const result = http.get(''https://test-api.k6.io/public/crocodiles/'');\n  check(result, {\n    ''http response status code is 200'': result.status === 200,\n  });\n}",
  },
];

export default tests;
