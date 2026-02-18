const { test, expect } = require('@playwright/test');
const { Pool } = require('pg');

const BASE_URL = 'http://localhost:3000';

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'orders',
  port: 5432,
});

function extractMetric(metricsText, metricName) {
  const match = metricsText.match(new RegExp(`${metricName} (\\d+)`));
  return match ? parseInt(match[1], 10) : 0;
}

test('should increment failure metrics when payment fails', async ({ request }) => {

  // Step 1: Get current failure metric
  const beforeMetrics = await request.get(`${BASE_URL}/metrics`);
  const beforeText = await beforeMetrics.text();
  const beforeFailures = extractMetric(beforeText, 'orders_failed_total');

  let failedOrderId = null;

  // Step 2: Create orders until one fails
  for (let i = 0; i < 10; i++) {
    const response = await request.post(`${BASE_URL}/order`, {
      data: { amount: 100 }
    });

    const body = await response.json();

    if (body.status === 'failed') {
      failedOrderId = body.orderId;
      break;
    }

    // if we reach the end without a failure, force one
    if (i === 9) {
      const response = await request.post(`${BASE_URL}/order`, {
        data: { amount: 100, forceFail: true }
      });

      const body = await response.json();

      if (body.status === 'failed') {
        failedOrderId = body.orderId;
      }
    }
  }

  expect(failedOrderId).not.toBeNull();

  // Step 3: Verify DB reflects failure
  await new Promise(res => setTimeout(res, 1000));

  const result = await pool.query(
    'SELECT status FROM orders WHERE id = $1',
    [failedOrderId]
  );

  expect(result.rows[0].status).toBe('failed');

  // Step 4: Verify metric incremented
  const afterMetrics = await request.get(`${BASE_URL}/metrics`);
  const afterText = await afterMetrics.text();
  const afterFailures = extractMetric(afterText, 'orders_failed_total');

  expect(afterFailures).toBeGreaterThan(beforeFailures);
});
