"import http from \"k6/http\";\nimport { check } from \"k6\";\n\nexport let options = {\n  stages: [\n    { target: 200, duration: \"30s\" },\n    { target: 0, duration: \"30s\" },\n  ],\n};\n\nexport default function () {\n  const result = http.get(\"https://test-api.k6.io/public/crocodiles/\");\n  check(result, {\n    \"http response status code is 200\": result.status === 200,\n  });\n}\n"