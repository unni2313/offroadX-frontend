/**
 * API Test Utility for Events.jsx
 * Use this in the browser console to test API endpoints
 * 
 * Usage:
 * 1. Go to http://localhost:5173 (or your frontend URL)
 * 2. Open DevTools (F12)
 * 3. Go to Console tab
 * 4. Run: testAllAPIs() to test all endpoints
 */

import API_BASE_URL from '../config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Test individual API endpoint
 */
export const testEndpoint = async (method, endpoint, body = null) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: getAuthHeaders()
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`\n📡 Testing ${method} ${endpoint}`);
    console.log(`🔗 Full URL: ${url}`);

    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);

    if (response.ok) {
      console.log(`✅ Success (${response.status})`);
      console.log('Response:', data);
      return { success: true, status: response.status, data };
    } else {
      console.error(`❌ Failed (${response.status})`);
      console.error('Error:', data);
      return { success: false, status: response.status, data };
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test all Events.jsx API endpoints
 */
export const testAllAPIs = async () => {
  console.log('🧪 Testing All Events.jsx API Endpoints\n');
  console.log(`📍 Backend: ${API_BASE_URL}\n`);
  console.log('═══════════════════════════════════════════════\n');

  const results = {
    passed: [],
    failed: []
  };

  // Test 1: Fetch Events
  console.log('\n--- TEST 1: GET /api/events ---');
  let result = await testEndpoint('GET', '/api/events');
  results[result.success ? 'passed' : 'failed'].push('GET /api/events');

  // Test 2: Fetch Routes
  console.log('\n--- TEST 2: GET /api/routes ---');
  result = await testEndpoint('GET', '/api/routes');
  results[result.success ? 'passed' : 'failed'].push('GET /api/routes');

  // Test 3: Fetch Results
  console.log('\n--- TEST 3: GET /api/results ---');
  result = await testEndpoint('GET', '/api/results');
  results[result.success ? 'passed' : 'failed'].push('GET /api/results');

  // Test 4: Fetch Races
  console.log('\n--- TEST 4: GET /api/races ---');
  result = await testEndpoint('GET', '/api/races');
  results[result.success ? 'passed' : 'failed'].push('GET /api/races');

  // Test 5: Fetch Users (for admin)
  console.log('\n--- TEST 5: GET /api/admin/users ---');
  result = await testEndpoint('GET', '/api/admin/users');
  results[result.success ? 'passed' : 'failed'].push('GET /api/admin/users');

  // Test 6: Fetch Current User Profile
  console.log('\n--- TEST 6: GET /api/profile ---');
  result = await testEndpoint('GET', '/api/profile');
  results[result.success ? 'passed' : 'failed'].push('GET /api/profile');

  // Print Summary
  console.log('\n═══════════════════════════════════════════════\n');
  console.log('📊 TEST SUMMARY\n');
  console.log(`✅ Passed: ${results.passed.length}`);
  if (results.passed.length > 0) {
    results.passed.forEach(endpoint => console.log(`   ✓ ${endpoint}`));
  }

  console.log(`\n❌ Failed: ${results.failed.length}`);
  if (results.failed.length > 0) {
    results.failed.forEach(endpoint => console.log(`   ✗ ${endpoint}`));
  }

  console.log(`\n🎯 Success Rate: ${Math.round((results.passed.length / (results.passed.length + results.failed.length)) * 100)}%`);

  if (results.failed.length === 0) {
    console.log('\n🎉 All tests passed! API is working correctly.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Check your backend and authentication token.\n');
  }

  return results;
};

/**
 * Test Create Event
 */
export const testCreateEvent = async (eventData) => {
  console.log('\n🎬 Testing CREATE EVENT\n');

  const payload = {
    name: eventData.name || 'Test Event',
    date: eventData.date || '2025-03-15',
    time: eventData.time || '09:00',
    location: eventData.location || 'Test Location',
    maxParticipants: eventData.maxParticipants || 50,
    difficulty: eventData.difficulty || 'Medium',
    duration: eventData.duration || '240',
    description: eventData.description || 'Test event description'
  };

  console.log('📋 Payload:', payload);
  const result = await testEndpoint('POST', '/api/events', payload);

  if (result.success && result.data?._id) {
    console.log(`\n✨ Event created with ID: ${result.data._id}`);
  }

  return result;
};

/**
 * Test Update Event
 */
export const testUpdateEvent = async (eventId, eventData) => {
  console.log(`\n✏️  Testing UPDATE EVENT (ID: ${eventId})\n`);

  const payload = {
    name: eventData.name || 'Updated Event',
    status: eventData.status || 'upcoming',
    ...eventData
  };

  console.log('📋 Payload:', payload);
  return await testEndpoint('PUT', `/api/events/${eventId}`, payload);
};

/**
 * Test Delete Event
 */
export const testDeleteEvent = async (eventId) => {
  console.log(`\n🗑️  Testing DELETE EVENT (ID: ${eventId})\n`);
  return await testEndpoint('DELETE', `/api/events/${eventId}`);
};

/**
 * Test Get Event Registrations
 */
export const testGetEventRegistrations = async (eventId) => {
  console.log(`\n📋 Testing GET EVENT REGISTRATIONS (ID: ${eventId})\n`);
  return await testEndpoint('GET', `/api/events/${eventId}/registrations`);
};

/**
 * Test Approve Registration
 */
export const testApproveRegistration = async (registrationId) => {
  console.log(`\n✅ Testing APPROVE REGISTRATION (ID: ${registrationId})\n`);
  return await testEndpoint('POST', `/api/registrations/${registrationId}/approve`);
};

/**
 * Test Reject Registration
 */
export const testRejectRegistration = async (registrationId) => {
  console.log(`\n❌ Testing REJECT REGISTRATION (ID: ${registrationId})\n`);
  return await testEndpoint('POST', `/api/registrations/${registrationId}/reject`);
};

/**
 * Test Get Event Results
 */
export const testGetEventResults = async (eventId) => {
  console.log(`\n🏆 Testing GET EVENT RESULTS (ID: ${eventId})\n`);
  return await testEndpoint('GET', `/api/events/${eventId}/results`);
};

/**
 * Test Verify Participant
 */
export const testVerifyParticipant = async (participationId) => {
  console.log(`\n🔍 Testing VERIFY PARTICIPANT (ID: ${participationId})\n`);
  return await testEndpoint('POST', `/api/participations/${participationId}/verify`);
};

/**
 * Test Save Race Result
 */
export const testSaveRaceResult = async (resultData) => {
  console.log('\n⏱️  Testing SAVE RACE RESULT\n');

  const payload = {
    eventId: resultData.eventId || 'test-event-id',
    participantId: resultData.participantId || 'test-participant-id',
    raceTime: resultData.raceTime || '01:23:45.678',
    position: resultData.position || 1,
    ...resultData
  };

  console.log('📋 Payload:', payload);
  return await testEndpoint('POST', '/api/results', payload);
};

/**
 * Helper: Print API configuration
 */
export const printAPIConfig = () => {
  console.log('\n📍 API Configuration\n');
  console.log(`Backend URL: ${API_BASE_URL}`);
  console.log(`Auth Token: ${localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}`);
  console.log(`User Data: ${localStorage.getItem('user') ? '✅ Present' : '❌ Missing'}\n`);
};

/**
 * Export all functions for window access in browser console
 */
if (typeof window !== 'undefined') {
  window.apiTests = {
    test: testEndpoint,
    testAll: testAllAPIs,
    testCreateEvent,
    testUpdateEvent,
    testDeleteEvent,
    testGetEventRegistrations,
    testApproveRegistration,
    testRejectRegistration,
    testGetEventResults,
    testVerifyParticipant,
    testSaveRaceResult,
    printAPIConfig
  };

  console.log('%c🧪 API Test Utilities Available', 'color: #ff9900; font-size: 16px; font-weight: bold;');
  console.log('%cAvailable Functions:', 'color: #00aa00; font-weight: bold;');
  console.log('• apiTests.testAll() - Test all endpoints');
  console.log('• apiTests.printAPIConfig() - Show current config');
  console.log('• apiTests.testCreateEvent(data) - Test create');
  console.log('• apiTests.testUpdateEvent(id, data) - Test update');
  console.log('• apiTests.testDeleteEvent(id) - Test delete');
  console.log('\n%cType apiTests.<function>() to run', 'color: #0099ff; font-style: italic;');
}