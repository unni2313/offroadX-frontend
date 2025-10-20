/**
 * API Test Script for Events.jsx
 * Tests all API endpoints used in the Events component
 * Run with: node test-api-calls.js
 */

// Mock token (replace with your actual token or get from login)
const MOCK_TOKEN = 'your_jwt_token_here';

// API Base URL from config
const API_BASE_URL = 'https://offroadx-backend.onrender.com';

console.log('🧪 OffroadX API Test Suite\n');
console.log(`📍 Backend URL: ${API_BASE_URL}\n`);

/**
 * Test data for creating/updating events and races
 */
const TEST_DATA = {
  event: {
    name: 'Test Mountain Rally',
    date: '2025-03-15',
    time: '09:00',
    location: 'Rocky Mountain Pass',
    maxParticipants: 50,
    difficulty: 'Hard',
    duration: '240',
    description: 'An exciting offroad event for experienced drivers'
  },
  race: {
    name: 'Test Sprint Race',
    type: 'sprint',
    date: '2025-03-15',
    startTime: '09:00',
    estimatedDuration: '60',
    description: 'Test sprint race'
  }
};

/**
 * API Test Cases
 */
const API_TESTS = [
  {
    name: 'GET /api/events (Fetch all events)',
    method: 'GET',
    endpoint: '/api/events',
    requiresAuth: true,
    expectedStatus: 200
  },
  {
    name: 'GET /api/routes (Fetch all routes)',
    method: 'GET',
    endpoint: '/api/routes',
    requiresAuth: true,
    expectedStatus: 200
  },
  {
    name: 'GET /api/results (Fetch all race results)',
    method: 'GET',
    endpoint: '/api/results',
    requiresAuth: true,
    expectedStatus: [200, 404] // Might be empty
  },
  {
    name: 'POST /api/events (Create new event)',
    method: 'POST',
    endpoint: '/api/events',
    requiresAuth: true,
    body: TEST_DATA.event,
    expectedStatus: [201, 200],
    isCreatingData: true
  },
  {
    name: 'GET /api/events/:id/registrations (Get event registrations)',
    method: 'GET',
    endpoint: '/api/events/{eventId}/registrations',
    requiresAuth: true,
    expectedStatus: [200, 404],
    needsEventId: true
  },
  {
    name: 'GET /api/races (Fetch all races)',
    method: 'GET',
    endpoint: '/api/races',
    requiresAuth: true,
    expectedStatus: 200
  }
];

/**
 * Helper function to log test results
 */
function logResult(testName, success, details = '') {
  const icon = success ? '✅' : '❌';
  const message = `${icon} ${testName}`;
  console.log(message);
  if (details) console.log(`   ${details}`);
}

/**
 * Perform an API test
 */
async function testAPI(test, createdIds = {}) {
  try {
    // Replace placeholders with actual IDs
    let endpoint = test.endpoint;
    if (endpoint.includes('{eventId}') && createdIds.eventId) {
      endpoint = endpoint.replace('{eventId}', createdIds.eventId);
    }

    const url = `${API_BASE_URL}${endpoint}`;

    const options = {
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add authorization if required
    if (test.requiresAuth && MOCK_TOKEN !== 'your_jwt_token_here') {
      options.headers['Authorization'] = `Bearer ${MOCK_TOKEN}`;
    }

    // Add request body if present
    if (test.body) {
      options.body = JSON.stringify(test.body);
    }

    console.log(`\n📡 Testing: ${test.name}`);
    console.log(`   Endpoint: ${endpoint}`);
    console.log(`   Method: ${test.method}`);

    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);

    const expectedStatus = Array.isArray(test.expectedStatus) 
      ? test.expectedStatus 
      : [test.expectedStatus];

    const statusMatch = expectedStatus.includes(response.status);

    if (statusMatch) {
      logResult(test.name, true, `Status: ${response.status}`);
      
      if (test.isCreatingData && data?._id) {
        createdIds.eventId = data._id;
        console.log(`   ✨ Created ID: ${data._id}`);
      }

      if (data) {
        const itemCount = Array.isArray(data) ? data.length : 1;
        console.log(`   📊 Response: ${itemCount} item(s) received`);
      }

      return { success: true, data, createdIds };
    } else {
      logResult(test.name, false, `Expected: ${test.expectedStatus}, Got: ${response.status}`);
      if (data?.error) console.log(`   Error: ${data.error}`);
      return { success: false, data, createdIds };
    }

  } catch (error) {
    logResult(test.name, false, `Network Error: ${error.message}`);
    return { success: false, error: error.message, createdIds };
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('═══════════════════════════════════════════════════════════\n');

  if (MOCK_TOKEN === 'your_jwt_token_here') {
    console.log('⚠️  WARNING: Using mock token. Tests will fail without authentication.\n');
    console.log('📌 To run complete tests:');
    console.log('   1. Get a valid JWT token from your backend');
    console.log('   2. Replace MOCK_TOKEN in this file\n');
  }

  let results = {
    passed: 0,
    failed: 0,
    createdIds: {}
  };

  // Run tests sequentially
  for (const test of API_TESTS) {
    const result = await testAPI(test, results.createdIds);
    results.createdIds = result.createdIds;

    if (result.success) {
      results.passed++;
    } else {
      results.failed++;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total:  ${results.passed + results.failed}`);
  console.log(`🎯 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%\n`);

  if (results.failed === 0) {
    console.log('🎉 All tests passed! Your API is working correctly.\n');
  } else {
    console.log('⚠️  Some tests failed. Check the details above.\n');
  }
}

// Run tests
runTests().catch(console.error);