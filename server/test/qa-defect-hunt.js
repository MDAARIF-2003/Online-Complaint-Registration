const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Complaint = require('../src/models/Complaint');
const Category = require('../src/models/Category');
const Feedback = require('../src/models/Feedback');

let mongod;
let server;
let baseUrl;

// Helper to make HTTP requests
const request = ({ method, path, headers = {}, body = null }) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
};

async function runDefectRetest() {
  console.log('====================================================');
  console.log('    RUNNING POST-FIX DEFECT VERIFICATION & RETEST   ');
  console.log('====================================================');

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[QA Test Server] Active on ${baseUrl}\n`);

  // Setup seed users
  const adminUser = await User.create({
    name: 'QA Admin',
    email: 'admin@test.qa',
    password: 'Password123!',
    role: 'ADMIN',
    status: 'ACTIVE',
  });

  const agentUser = await User.create({
    name: 'QA Agent',
    email: 'agent@test.qa',
    password: 'Password123!',
    role: 'AGENT',
    department: 'Hardware',
    status: 'ACTIVE',
  });

  const citizenUser = await User.create({
    name: 'QA Citizen',
    email: 'citizen@test.qa',
    password: 'Password123!',
    role: 'USER',
    status: 'ACTIVE',
  });

  const activeCategory = await Category.create({
    name: 'Hardware & Infrastructure',
    description: 'Hardware lab issues',
    isActive: true,
  });

  const inactiveCategory = await Category.create({
    name: 'Decommissioned Category',
    description: 'Deprecated service',
    isActive: false,
  });

  // Log in each user
  const adminLogin = await request({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'admin@test.qa', password: 'Password123!' },
  });
  const adminToken = adminLogin.data.token;

  const agentLogin = await request({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'agent@test.qa', password: 'Password123!' },
  });
  const agentToken = agentLogin.data.token;

  const citizenLogin = await request({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'citizen@test.qa', password: 'Password123!' },
  });
  const citizenToken = citizenLogin.data.token;

  const retestResults = [];

  // ============================================================
  // RETEST 1 (BG-001): Regex Metacharacter Escaping in Search
  // ============================================================
  console.log('--- Retest 1 (BG-001): Regex Metacharacter Escaping in Search ---');
  const res1 = await request({
    method: 'GET',
    path: '/api/complaints?search=[invalid_regex',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  const pass1 = res1.status === 200;
  console.log(`[BG-001.1] GET /api/complaints?search=[invalid_regex -> Status: ${res1.status} (Expected: 200) -> ${pass1 ? 'PASS' : 'FAIL'}`);
  retestResults.push({ id: 'BG-001.1', test: 'Complaint search regex escape', pass: pass1, status: res1.status });

  const res2 = await request({
    method: 'GET',
    path: '/api/admin/users?search=(unclosed_paren',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const pass2 = res2.status === 200;
  console.log(`[BG-001.2] GET /api/admin/users?search=(unclosed_paren -> Status: ${res2.status} (Expected: 200) -> ${pass2 ? 'PASS' : 'FAIL'}`);
  retestResults.push({ id: 'BG-001.2', test: 'Admin user search regex escape', pass: pass2, status: res2.status });

  const res3 = await request({
    method: 'GET',
    path: '/api/agent/complaints?search=*wildcard',
    headers: { Authorization: `Bearer ${agentToken}` },
  });
  const pass3 = res3.status === 200;
  console.log(`[BG-001.3] GET /api/agent/complaints?search=*wildcard -> Status: ${res3.status} (Expected: 200) -> ${pass3 ? 'PASS' : 'FAIL'}`);
  retestResults.push({ id: 'BG-001.3', test: 'Agent complaint search regex escape', pass: pass3, status: res3.status });

  // ============================================================
  // RETEST 2 (BG-002): Category Validation on Complaint Creation
  // ============================================================
  console.log('\n--- Retest 2 (BG-002): Category Validation on Complaint Registration ---');
  const resCat1 = await request({
    method: 'POST',
    path: '/api/complaints',
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: {
      title: 'Network printer is smoking',
      description: 'Smoke is coming out of the main office network printer.',
      category: 'NonExistentCategoryXYZ',
      priority: 'HIGH',
    },
  });
  const passCat1 = resCat1.status === 400 && resCat1.data.message.includes('invalid or currently inactive');
  console.log(`[BG-002.1] Non-existent category -> Status: ${resCat1.status} (Expected: 400) -> ${passCat1 ? 'PASS' : 'FAIL'}`);
  retestResults.push({ id: 'BG-002.1', test: 'Reject non-existent category', pass: passCat1, status: resCat1.status });

  const resCat2 = await request({
    method: 'POST',
    path: '/api/complaints',
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: {
      title: 'Legacy system decommissioned report',
      description: 'Trying to file under decommissioned inactive category.',
      category: 'Decommissioned Category',
      priority: 'LOW',
    },
  });
  const passCat2 = resCat2.status === 400 && resCat2.data.message.includes('invalid or currently inactive');
  console.log(`[BG-002.2] Inactive category -> Status: ${resCat2.status} (Expected: 400) -> ${passCat2 ? 'PASS' : 'FAIL'}`);
  retestResults.push({ id: 'BG-002.2', test: 'Reject inactive category', pass: passCat2, status: resCat2.status });

  const resCatValid = await request({
    method: 'POST',
    path: '/api/complaints',
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: {
      title: 'Legitimate Hardware Failure',
      description: 'Computer display port broken on desk 14.',
      category: 'Hardware & Infrastructure',
      priority: 'MEDIUM',
    },
  });
  const passCatValid = resCatValid.status === 201;
  console.log(`[BG-002.3] Valid active category -> Status: ${resCatValid.status} (Expected: 201) -> ${passCatValid ? 'PASS' : 'FAIL'}`);
  retestResults.push({ id: 'BG-002.3', test: 'Accept valid active category', pass: passCatValid, status: resCatValid.status });
  const testComplaint = resCatValid.data.complaint;

  // ============================================================
  // RETEST 3 (BG-003): Closed Complaint Messaging Restriction
  // ============================================================
  console.log('\n--- Retest 3 (BG-003): Closed Complaint Messaging Restriction ---');
  // Admin assign
  await request({
    method: 'POST',
    path: `/api/admin/complaints/${testComplaint._id}/assign`,
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { agentId: agentUser._id },
  });
  // Agent in progress & resolve
  await request({
    method: 'PATCH',
    path: `/api/agent/complaints/${testComplaint._id}/status`,
    headers: { Authorization: `Bearer ${agentToken}` },
    body: { status: 'In Progress', note: 'Technician working.' },
  });
  await request({
    method: 'PATCH',
    path: `/api/agent/complaints/${testComplaint._id}/status`,
    headers: { Authorization: `Bearer ${agentToken}` },
    body: { status: 'Resolved', resolutionNotes: 'Replaced port.' },
  });
  // Admin Close
  await request({
    method: 'PATCH',
    path: `/api/admin/complaints/${testComplaint._id}/status`,
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'Closed', note: 'Case finalized and archived.' },
  });

  const msgRes = await request({
    method: 'POST',
    path: `/api/complaints/${testComplaint._id}/messages`,
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: { message: 'Can I ask a question after closure?' },
  });
  const passMsg = msgRes.status === 400 && msgRes.data.message.includes('closed complaint');
  console.log(`[BG-003] Message on Closed complaint -> Status: ${msgRes.status} (Expected: 400) -> ${passMsg ? 'PASS' : 'FAIL'}`);
  retestResults.push({ id: 'BG-003', test: 'Reject messages on closed complaints', pass: passMsg, status: msgRes.status });

  // ============================================================
  // RETEST 4 (BG-004): Reopen Timestamp Integrity (resolvedAt null)
  // ============================================================
  console.log('\n--- Retest 4 (BG-004): Reopen Timestamp Integrity ---');
  const cRes = await request({
    method: 'POST',
    path: '/api/complaints',
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: {
      title: 'Lab projector flickering again',
      description: 'The projector image cuts out every 30 seconds.',
      category: 'Hardware & Infrastructure',
      priority: 'MEDIUM',
    },
  });
  const cId = cRes.data.complaint._id;

  await request({
    method: 'POST',
    path: `/api/admin/complaints/${cId}/assign`,
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { agentId: agentUser._id },
  });
  await request({
    method: 'PATCH',
    path: `/api/agent/complaints/${cId}/status`,
    headers: { Authorization: `Bearer ${agentToken}` },
    body: { status: 'In Progress', note: 'Checking cable.' },
  });
  await request({
    method: 'PATCH',
    path: `/api/agent/complaints/${cId}/status`,
    headers: { Authorization: `Bearer ${agentToken}` },
    body: { status: 'Resolved', resolutionNotes: 'Replaced HDMI cable.' },
  });

  // Reopen
  await request({
    method: 'POST',
    path: `/api/complaints/${cId}/reopen`,
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: { reason: 'Flickering restarted after meeting.' },
  });

  const reopenedDoc = await Complaint.findById(cId);
  const passReopenTimestamp = reopenedDoc.status === 'Reopened' && reopenedDoc.resolvedAt === null;
  console.log(`[BG-004] Reopen status: ${reopenedDoc.status}, resolvedAt: ${reopenedDoc.resolvedAt} (Expected: null) -> ${passReopenTimestamp ? 'PASS' : 'FAIL'}`);
  retestResults.push({ id: 'BG-004', test: 'Reset resolvedAt to null on reopen', pass: passReopenTimestamp, status: reopenedDoc.resolvedAt === null ? 200 : 500 });

  // ============================================================
  // RETEST 5 (BG-005): Admin Assignment on Closed Complaint
  // ============================================================
  console.log('\n--- Retest 5 (BG-005): Admin Assignment on Closed Complaint ---');
  const assignClosedRes = await request({
    method: 'POST',
    path: `/api/admin/complaints/${testComplaint._id}/assign`,
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { agentId: agentUser._id, note: 'Attempting to reassign closed ticket.' },
  });
  const passAssignClosed = assignClosedRes.status === 400 && assignClosedRes.data.message.includes('closed complaint');
  console.log(`[BG-005] Assign to Closed complaint -> Status: ${assignClosedRes.status} (Expected: 400) -> ${passAssignClosed ? 'PASS' : 'FAIL'}`);
  retestResults.push({ id: 'BG-005', test: 'Prevent assigning agent to closed complaint', pass: passAssignClosed, status: assignClosedRes.status });

  // ============================================================
  // RETEST 6 (BG-006): Feedback Integer Star Rating Enforcement
  // ============================================================
  console.log('\n--- Retest 6 (BG-006): Feedback Integer Star Rating Enforcement ---');
  const cFeed = await request({
    method: 'POST',
    path: '/api/complaints',
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: {
      title: 'Air conditioner leaking water in server room',
      description: 'AC unit in server room leaking condensation on rack.',
      category: 'Hardware & Infrastructure',
      priority: 'URGENT',
    },
  });
  const cFeedId = cFeed.data.complaint._id;

  await request({
    method: 'POST',
    path: `/api/admin/complaints/${cFeedId}/assign`,
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { agentId: agentUser._id },
  });
  await request({
    method: 'PATCH',
    path: `/api/agent/complaints/${cFeedId}/status`,
    headers: { Authorization: `Bearer ${agentToken}` },
    body: { status: 'In Progress', note: 'Cleared drainage pipe.' },
  });
  await request({
    method: 'PATCH',
    path: `/api/agent/complaints/${cFeedId}/status`,
    headers: { Authorization: `Bearer ${agentToken}` },
    body: { status: 'Resolved', resolutionNotes: 'Drainage pipe unblocked.' },
  });

  const feedFloatRes = await request({
    method: 'POST',
    path: `/api/complaints/${cFeedId}/feedback`,
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: { rating: 3.5, comments: 'Decimal rating should be rejected.' },
  });
  const passFloatFeed = feedFloatRes.status === 400 && feedFloatRes.data.message.includes('integer between 1 and 5');
  console.log(`[BG-006.1] Float rating (3.5) -> Status: ${feedFloatRes.status} (Expected: 400) -> ${passFloatFeed ? 'PASS' : 'FAIL'}`);
  retestResults.push({ id: 'BG-006.1', test: 'Reject float rating (3.5)', pass: passFloatFeed, status: feedFloatRes.status });

  const feedIntRes = await request({
    method: 'POST',
    path: `/api/complaints/${cFeedId}/feedback`,
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: { rating: 4, comments: 'Prompt resolution, great technician.' },
  });
  const passIntFeed = feedIntRes.status === 201;
  console.log(`[BG-006.2] Integer rating (4) -> Status: ${feedIntRes.status} (Expected: 201) -> ${passIntFeed ? 'PASS' : 'FAIL'}`);
  retestResults.push({ id: 'BG-006.2', test: 'Accept integer rating (4)', pass: passIntFeed, status: feedIntRes.status });

  // ============================================================
  // RETEST 7 (BG-007): Agent Resume Work on Reopened Complaint
  // ============================================================
  console.log('\n--- Retest 7 (BG-007): Agent Resuming Work on Reopened Complaint ---');
  const agentResumeRes = await request({
    method: 'PATCH',
    path: `/api/agent/complaints/${cId}/status`,
    headers: { Authorization: `Bearer ${agentToken}` },
    body: { status: 'In Progress', note: 'Re-dispatched technician to replace motherboard.' },
  });
  const passResume = agentResumeRes.status === 200 && agentResumeRes.data.complaint.status === 'In Progress';
  console.log(`[BG-007] Transition Reopened -> In Progress -> Status: ${agentResumeRes.status} (Expected: 200) -> ${passResume ? 'PASS' : 'FAIL'}`);
  retestResults.push({ id: 'BG-007', test: 'Agent resume progress on Reopened complaint', pass: passResume, status: agentResumeRes.status });

  console.log('\n====================================================');
  console.log('              ALL RETESTS COMPLETE                  ');
  console.log('====================================================');
  console.table(retestResults);

  const allPassed = retestResults.every((r) => r.pass);
  console.log(`\nOverall Retest Status: ${allPassed ? 'ALL 10 VERIFICATION CHECKS PASSED (100%)' : 'FAILURES DETECTED'}`);

  await mongoose.disconnect();
  await mongod.stop();
  server.close();

  if (!allPassed) process.exit(1);
}

runDefectRetest()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Retest error:', err);
    process.exit(1);
  });
