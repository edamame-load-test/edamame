import http from "k6/http";
export const options = {
  vus: 1000,
  duration: "60s",
};

export default function () {
  http.get("https://test-api.k6.io/public/crocodiles/1/");
  http.get("https://test-api.k6.io/public/crocodiles/1/");
  http.get("https://test-api.k6.io/public/crocodiles/1/");
  http.get("https://test-api.k6.io/public/crocodiles/1/");
  http.get("https://test-api.k6.io/public/crocodiles/1/");
  http.get("https://test-api.k6.io/public/crocodiles/1/");
  http.get("https://test-api.k6.io/public/crocodiles/1/");
  http.get("https://test-api.k6.io/public/crocodiles/1/");
  http.get("https://test-api.k6.io/public/crocodiles/1/");
  http.get("https://test-api.k6.io/public/crocodiles/1/");
  sleep(0.06);
}
