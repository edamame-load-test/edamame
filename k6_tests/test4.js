import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    shared_iter_scenario: {
      executor: "shared-iterations",
      vus: 10,
      iterations: 100,
      startTime: "0s",
    },
    per_vu_scenario: {
      executor: "per-vu-iterations",
      vus: 20,
      iterations: 10,
      startTime: "10s",
    },
  },
};

export default function () {
  const result = http.get('https://test-api.k6.io/public/crocodiles/');
  check(result, {
    'http response status code is 200': result.status === 200,
  });
}

