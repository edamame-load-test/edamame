function generateGrafanaUrl(testName) {
  return `http://localhost:3000/d/IWSghv-5k/http-ws-data?orgId=1&refresh=5s&var-testname=${testName}`;
}

export default generateGrafanaUrl;
