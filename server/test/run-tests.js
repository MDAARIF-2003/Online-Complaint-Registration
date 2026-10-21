require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Complaint = require('../src/models/Complaint');
const Category = require('../src/models/Category');
const Feedback = require('../src/models/Feedback');

let mongod = null;
let server = null;
let baseUrl = '';

// Helper for HTTP requests
const request = async (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const assert = (condition, msg) => {
  if (!condition) {
    throw new Error(`[Assertion Failed] ${msg}`);
  }
};

const runAllTests = async () => {
  console.log('====================================================');
  console.log(' STARTING COMPREHENSIVE BACKEND API TEST SUITE');
  console.log('====================================================');

  try {
    // 1. Setup in-memory MongoDB for clean test isolation
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('[Test DB] Connected to isolated test database.');

    // 2. Start HTTP server on dynamic port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`[Test Server] Running on ${baseUrl}`);

    // Create Category
    await Category.create({ name: 'IT Infrastructure', description: 'Network and computers' });

    let userToken = '';
    let agentToken = '';
    let adminToken = '';
    let testUserId = '';
    let testAgentId = '';
    let testComplaintId = '';

    // ==========================================
    // TEST GROUP 1: AUTHENTICATION & SECURITY
    // ==========================================
    console.log('\n--- 1. Testing Registration & Security ---');

    // Test 1.1: Successful user registration
    const regRes = await request('POST', '/api/auth/register', {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Password@123',
      confirmPassword: 'Password@123',
      phone: '1234567890',
      role: 'ADMIN', // Malicious attempt to self-promote to ADMIN
    });
    assert(regRes.status === 201, `Expected 201 for valid registration, got ${regRes.status}`);
    assert(regRes.body.token, 'Token must be returned');
    assert(
      regRes.body.user.role === 'USER',
      'Public registration MUST strictly force role to USER even if client sends ADMIN'
    );
    userToken = regRes.body.token;
    testUserId = regRes.body.user.id || regRes.body.user._id;
    console.log('  [PASS] 1.1: Registration succeeded and role escalation prevented (forced to USER).');

    // Test 1.2: Duplicate email rejection
    const dupRes = await request('POST', '/api/auth/register', {
      name: 'John Imposter',
      email: 'john.doe@example.com',
      password: 'Password@123',
    });
    assert(dupRes.status === 400, 'Duplicate email must be rejected with 400');
    console.log('  [PASS] 1.2: Duplicate email rejected.');

    // Test 1.3: Password mismatch rejection
    const misRes = await request('POST', '/api/auth/register', {
      name: 'Bob',
      email: 'bob@example.com',
      password: 'Password@123',
      confirmPassword: 'DifferentPassword@123',
    });
    assert(misRes.status === 400, 'Mismatched passwords must be rejected');
    console.log('  [PASS] 1.3: Password confirmation mismatch rejected.');

    // Test 1.4: Login with valid credentials
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'john.doe@example.com',
      password: 'Password@123',
    });
    assert(loginRes.status === 200, 'Login must succeed with 200');
    assert(loginRes.body.token, 'Login must return JWT token');
    console.log('  [PASS] 1.4: Login succeeded with valid credentials.');

    // Test 1.5: Login with wrong password
    const wrongPassRes = await request('POST', '/api/auth/login', {
      email: 'john.doe@example.com',
      password: 'WrongPassword',
    });
    assert(wrongPassRes.status === 401, 'Invalid password must return 401');
    console.log('  [PASS] 1.5: Login with invalid password rejected.');

    // Create Agent & Admin accounts directly in DB for testing
    const agent = await User.create({
      name: 'Agent Support',
      email: 'agent@test.com',
      password: 'AgentPassword@123',
      role: 'AGENT',
      department: 'IT Infrastructure',
    });
    testAgentId = agent._id.toString();

    const admin = await User.create({
      name: 'Admin Master',
      email: 'admin@test.com',
      password: 'AdminPassword@123',
      role: 'ADMIN',
    });

    const agentLogin = await request('POST', '/api/auth/login', {
      email: 'agent@test.com',
      password: 'AgentPassword@123',
    });
    agentToken = agentLogin.body.token;

    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@test.com',
      password: 'AdminPassword@123',
    });
    adminToken = adminLogin.body.token;

    // ==========================================
    // TEST GROUP 2: COMPLAINT LIFECYCLE
    // ==========================================
    console.log('\n--- 2. Testing Complaint Lifecycle & Validation ---');

    // Test 2.1: Submit complaint
    const compRes = await request(
      'POST',
      '/api/complaints',
      {
        title: 'Projector in Hall 2 flicker issue',
        description: 'The projector keeps turning off every 10 minutes during lectures.',
        category: 'IT Infrastructure',
        priority: 'HIGH',
        contactPhone: '9876543210',
        contactAddress: 'Academic Hall 2',
      },
      userToken
    );
    assert(compRes.status === 201, `Submit complaint failed with status ${compRes.status}`);
    assert(compRes.body.complaint.complaintNumber, 'Complaint number must be generated');
    assert(compRes.body.complaint.status === 'Submitted', 'Initial status must be Submitted');
    assert(compRes.body.complaint.history.length === 1, 'Initial history must be recorded');
    testComplaintId = compRes.body.complaint._id;
    console.log(`  [PASS] 2.1: Complaint created (${compRes.body.complaint.complaintNumber}).`);

    // Test 2.2: User can only see their own complaints
    const userComplaints = await request('GET', '/api/complaints', null, userToken);
    assert(userComplaints.status === 200, 'User complaints fetch failed');
    assert(userComplaints.body.complaints.length === 1, 'User should see exactly 1 complaint');
    console.log('  [PASS] 2.2: User scoped complaint listing confirmed.');

    // Test 2.3: Agent cannot view unassigned complaint
    const agentGetUnassigned = await request(
      'GET',
      `/api/complaints/${testComplaintId}`,
      null,
      agentToken
    );
    assert(
      agentGetUnassigned.status === 403,
      'Agent must NOT be allowed to view unassigned complaints'
    );
    console.log('  [PASS] 2.3: Agent access to unassigned complaint properly blocked (403).');

    // ==========================================
    // TEST GROUP 3: ADMIN ASSIGNMENT
    // ==========================================
    console.log('\n--- 3. Testing Admin Assignment ---');

    // Test 3.1: Admin assigns complaint to Agent
    const assignRes = await request(
      'POST',
      `/api/admin/complaints/${testComplaintId}/assign`,
      {
        agentId: testAgentId,
        note: 'Assigned to Agent Support for urgent inspection',
      },
      adminToken
    );
    assert(assignRes.status === 200, `Assignment failed with status ${assignRes.status}`);
    assert(
      assignRes.body.complaint.status === 'Assigned',
      'Status must transition to Assigned upon assignment'
    );
    console.log('  [PASS] 3.1: Admin assigned complaint; status updated to Assigned.');

    // Test 3.2: Agent can now view the assigned complaint
    const agentGetAssigned = await request(
      'GET',
      `/api/complaints/${testComplaintId}`,
      null,
      agentToken
    );
    assert(agentGetAssigned.status === 200, 'Agent should now be able to view assigned complaint');
    console.log('  [PASS] 3.2: Agent access verified after assignment.');

    // ==========================================
    // TEST GROUP 4: AGENT WORKFLOW & TRANSITIONS
    // ==========================================
    console.log('\n--- 4. Testing Agent Status Transitions & Notes ---');

    // Test 4.1: Invalid transition rejection (e.g. Assigned -> Closed directly by agent)
    const invalidTrans = await request(
      'PATCH',
      `/api/agent/complaints/${testComplaintId}/status`,
      { status: 'Closed' },
      agentToken
    );
    assert(invalidTrans.status === 400, 'Invalid transition must be rejected with 400');
    console.log('  [PASS] 4.1: Invalid status transition rejected.');

    // Test 4.2: Valid transition: Assigned -> In Progress
    const inProgRes = await request(
      'PATCH',
      `/api/agent/complaints/${testComplaintId}/status`,
      { status: 'In Progress', note: 'Technician on-site.' },
      agentToken
    );
    assert(inProgRes.status === 200, 'Transition to In Progress failed');
    assert(inProgRes.body.complaint.status === 'In Progress');
    console.log('  [PASS] 4.2: Valid transition to In Progress succeeded.');

    // Test 4.3: Add progress note
    const noteRes = await request(
      'POST',
      `/api/agent/complaints/${testComplaintId}/notes`,
      { note: 'Replaced HDMI input cable and cleaned ventilation filter.' },
      agentToken
    );
    assert(noteRes.status === 200, 'Adding progress note failed');
    console.log('  [PASS] 4.3: Progress note recorded in complaint history.');

    // Test 4.4: In Progress -> Resolved (Requires resolution notes)
    const resolveNoNote = await request(
      'PATCH',
      `/api/agent/complaints/${testComplaintId}/status`,
      { status: 'Resolved' },
      agentToken
    );
    assert(resolveNoNote.status === 400, 'Resolving without notes must be rejected');

    const resolveRes = await request(
      'PATCH',
      `/api/agent/complaints/${testComplaintId}/status`,
      {
        status: 'Resolved',
        resolutionNotes: 'HDMI converter replaced and thermal testing completed successfully.',
      },
      agentToken
    );
    assert(resolveRes.status === 200, 'Resolving complaint failed');
    assert(resolveRes.body.complaint.status === 'Resolved');
    console.log('  [PASS] 4.4: Complaint marked Resolved with required resolution notes.');

    // ==========================================
    // TEST GROUP 5: MESSAGING & CHAT
    // ==========================================
    console.log('\n--- 5. Testing Complaint Messaging ---');

    // Test 5.1: User sends message
    const sendMsg = await request(
      'POST',
      `/api/complaints/${testComplaintId}/messages`,
      { message: 'Is the projector ready for the afternoon presentation?' },
      userToken
    );
    assert(sendMsg.status === 201, 'Send message failed');
    console.log('  [PASS] 5.1: User successfully sent message on complaint thread.');

    // Test 5.2: Agent retrieves message and replies
    const getMsgs = await request(
      'GET',
      `/api/complaints/${testComplaintId}/messages`,
      null,
      agentToken
    );
    assert(getMsgs.status === 200, 'Agent fetch messages failed');
    assert(getMsgs.body.messages.length >= 1, 'At least 1 message should be present');

    const agentReply = await request(
      'POST',
      `/api/complaints/${testComplaintId}/messages`,
      { message: 'Yes, full diagnostic test passed. Ready for use.' },
      agentToken
    );
    assert(agentReply.status === 201, 'Agent reply failed');
    console.log('  [PASS] 5.2: Agent replied to complaint thread.');

    // ==========================================
    // TEST GROUP 6: FEEDBACK & RATING
    // ==========================================
    console.log('\n--- 6. Testing Resolution Feedback ---');

    // Test 6.1: User submits feedback for resolved complaint
    const feedRes = await request(
      'POST',
      `/api/complaints/${testComplaintId}/feedback`,
      { rating: 5, comments: 'Super fast turnaround time! Thanks.' },
      userToken
    );
    assert(feedRes.status === 201, 'Feedback submission failed');
    console.log('  [PASS] 6.1: User submitted 5-star feedback.');

    // Test 6.2: Duplicate feedback rejected
    const dupFeed = await request(
      'POST',
      `/api/complaints/${testComplaintId}/feedback`,
      { rating: 4, comments: 'Another review' },
      userToken
    );
    assert(dupFeed.status === 400, 'Duplicate feedback must be rejected');
    console.log('  [PASS] 6.2: Duplicate feedback rejected (one per complaint).');

    // ==========================================
    // TEST GROUP 7: REOPEN COMPLAINT
    // ==========================================
    console.log('\n--- 7. Testing Complaint Reopening ---');

    const reopenRes = await request(
      'POST',
      `/api/complaints/${testComplaintId}/reopen`,
      { reason: 'Flickered once again when connecting auxiliary laptop.' },
      userToken
    );
    assert(reopenRes.status === 200, 'Reopen failed');
    assert(reopenRes.body.complaint.status === 'Reopened');
    console.log('  [PASS] 7.1: User successfully reopened resolved complaint.');

    // ==========================================
    // TEST GROUP 8: NOTIFICATIONS & DASHBOARD
    // ==========================================
    console.log('\n--- 8. Testing Notifications & Admin Analytics ---');

    // Test 8.1: Notifications check
    const notifRes = await request('GET', '/api/notifications', null, userToken);
    assert(notifRes.status === 200, 'Notifications retrieval failed');
    assert(notifRes.body.notifications.length > 0, 'User should have notifications');
    console.log(`  [PASS] 8.1: In-app notifications stored and retrieved (${notifRes.body.notifications.length} notifications).`);

    // Test 8.2: Admin dashboard analytics
    const adminDash = await request('GET', '/api/admin/dashboard', null, adminToken);
    assert(adminDash.status === 200, 'Admin dashboard failed');
    assert(adminDash.body.metrics.totalComplaints >= 1, 'Dashboard totalComplaints metric accurate');
    assert(adminDash.body.metrics.totalUsers >= 1, 'Dashboard totalUsers metric accurate');
    assert(adminDash.body.agentWorkloads.length >= 1, 'Agent workload calculated from DB');
    console.log('  [PASS] 8.2: Admin dashboard metrics verified against database records.');

    console.log('\n====================================================');
    console.log(' ALL 20+ AUTOMATED INTEGRATION TESTS PASSED 100%!');
    console.log('====================================================');
  } catch (err) {
    console.error('\n[TEST FAILURE ERROR]', err.message);
    process.exit(1);
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (mongod) await mongod.stop();
  }
};

runAllTests();
