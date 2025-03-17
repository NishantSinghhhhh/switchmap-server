import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 50,           // Simulate 50 concurrent users
  duration: '30s',   // Test runs for 30 seconds
};

export default function () {
  const res = http.get('https://api.switchmap-ng.com/status');

  check(res, {
    'Response time < 500ms': (r) => r.timings.duration < 500,
    'Status is 200':         (r) => r.status === 200,
  });

  sleep(1); // Wait 1s before the next request
}
