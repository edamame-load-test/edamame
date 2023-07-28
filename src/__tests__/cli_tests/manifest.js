import manifest from "../../utilities/manifest.js";
import mock from "mock-fs";

beforeAll(() => { 
  mock({
    '/temporary/k6_tests/': {
      'test1.js': `import http from 'k6/http';
        import { check } from 'k6';
      
        export let options = {
          stages: [
            { target: 200, duration: '30s' },
            { target: 600, duration: '60s' },
            { target: 0, duration: '30s' },
          ],
        };`,
        'test2.js': `export const options = {
          vus: 10000,
          duration: '30s',
        };`,
        'test3.js': `export const options = {
          discardResponseBodies: true,
          scenarios: {
            contacts: {
              executor: 'constant-arrival-rate',
              duration: '60s',
              rate: 1000,
              timeUnit: '1s',
              preAllocatedVUs: 3000,
              maxVUs: 3000,
            },
          },
        };`
    },
    'manifests/load_test_crds/': {
      'k6_crd.yaml': `{
        "apiVersion": "k6.io/v1alpha1",
        "kind": "K6",
        "metadata": {
          "name": "k6-edamame-test"
        },
        "spec": {
          "parallelism": 200,
          "script": {
            "configMap": {
              "name": 4,
              "file": "test99.js"
            }
          },
          "separate": true,
          "arguments": "--out distributed-statsd",
          "runner": {
            "image": "lukeoguro/xk6-statsd:latest",
            "env": [
              {
                "name": "K6_STATSD_ADDR",
                "value": "statsd-service:8125"
              },
              {
                "name": "POD_NAME",
                "valueFrom": {
                  "fieldRef": {
                    "fieldPath": "metadata.name"
                  }
                }
              },
              {
                "name": "K6_STATSD_GAUGE_NAMESPACE",
                "value": "$(POD_NAME)."
              },
              {
                "name": "K6_STATSD_NAMESPACE",
                "value": "4."
              }
            ],
            "affinity": {
              "nodeAffinity": {
                "requiredDuringSchedulingIgnoredDuringExecution": {
                  "nodeSelectorTerms": [
                    {
                      "matchExpressions": [
                        {
                          "key": "alpha.eksctl.io/nodegroup-name",
                          "operator": "In",
                          "values": [
                            "load-generators"
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            }
          }
        }
      }`
    }
  });
});

afterAll(() => {
  mock.restore();
});

test('parses an integer that is embedded in a string containing other non-numerical characters and returns it as a number', () => {
  expect(manifest.findNumber("vus: 5000")).toBe(5000);
});

test('returns the larger of 2 given numbers, where one given number is embedded in a string', () => {
  expect(manifest.maxNumVus(3000, "target: 4500")).toBe(4500);
});

test('base 64 encodes a value appropriately', () => {
  expect(manifest.base64("test")).toBe("dGVzdA==");
});

test('calculates parallelism argument accurately with appropriate rounding', () => {
  expect(manifest.parallelism(10, 50)).toBe(1);
});

test('reads latest test id property accurately from k6 custom resource file', () => {
  expect(manifest.latestK6TestId()).toBe(4);
});

test('discerns maximum number of vus accurately from test file containing multiple vu targets at different stages', () => {
  expect(manifest.numVus('/temporary/k6_tests/test1.js')).toBe(600);
});

test('discerns maximum number of vus accurately from test file containing vus property', () => {
  expect(manifest.numVus('/temporary/k6_tests/test2.js')).toBe(10000);
});

test('discerns maximum number of vus accurately from test file containing maxVUs property', () => {
  expect(manifest.numVus('/temporary/k6_tests/test3.js')).toBe(3000);
});

test('returns 0 maximum number of vus when test file cannot be found', () => {
  expect(manifest.numVus('/temporary/k6_tests/test100.js')).toBe(0);
});
