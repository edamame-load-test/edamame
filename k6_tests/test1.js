import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { target: 3, duration: '10s' },
    { target: 0, duration: '5s' },
  ],
};

export default function () {
  const result = http.get('https://test-api.k6.io/');
  check(result, {
    'http response status code is 200': result.status === 200,
  });
}

