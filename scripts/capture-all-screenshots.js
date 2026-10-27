const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://127.0.0.1:5173';
const OUTPUT_DIR = path.join(__dirname, '../documentation_assets/screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function setViewportDesktop(page) {
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
}

async function setViewportMobile(page) {
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
}

async function performLogin(page, email, password) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('input[type="email"]');
  
  await page.$eval('input[type="email"]', (el) => (el.value = ''));
  await page.type('input[type="email"]', email, { delay: 10 });
  await page.$eval('input[placeholder*="password"]', (el) => (el.value = ''));
  await page.type('input[placeholder*="password"]', password, { delay: 10 });
  
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => sleep(1000)),
  ]);
  await sleep(1200);
}

async function performLogout(page) {
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
    });
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await sleep(600);
  } catch (err) {
    console.warn('Logout fallback:', err.message);
  }
}

async function capture() {
  console.log('====================================================');
  console.log('   LAUNCHING LIVE APPLICATION SCREENSHOT CAPTURE    ');
  console.log('====================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1440,900',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();
  await setViewportDesktop(page);

  // ----------------------------------------------------
  // 01. Landing Page
  // ----------------------------------------------------
  console.log('[Capture 01/21] 01_landing_page.png...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_landing_page.png') });

  // ----------------------------------------------------
  // 02. User Registration Page
  // ----------------------------------------------------
  console.log('[Capture 02/21] 02_user_registration.png...');
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('input[name="name"]');
  await page.type('input[name="name"]', 'Aditya Verma', { delay: 10 });
  await page.type('input[name="email"]', 'aditya.verma@example.edu', { delay: 10 });
  await page.type('input[name="phone"]', '+91 98765 12345', { delay: 10 });
  await page.type('input[name="password"]', 'Password@123', { delay: 10 });
  await page.type('input[name="confirmPassword"]', 'Password@123', { delay: 10 });
  await sleep(500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_user_registration.png') });

  // ----------------------------------------------------
  // 03. User Login Page
  // ----------------------------------------------------
  console.log('[Capture 03/21] 03_user_login.png...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'user.priya@complaintportal.com', { delay: 10 });
  await page.type('input[placeholder*="password"]', 'User@12345', { delay: 10 });
  await sleep(500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_user_login.png') });

  // ----------------------------------------------------
  // 04. Ordinary User Dashboard
  // ----------------------------------------------------
  console.log('[Capture 04/21] 04_user_dashboard.png...');
  await performLogin(page, 'user.priya@complaintportal.com', 'User@12345');
  await page.goto(`${BASE_URL}/user/dashboard`, { waitUntil: 'networkidle0' });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_user_dashboard.png') });

  // ----------------------------------------------------
  // 05. Complaint Submission Form
  // ----------------------------------------------------
  console.log('[Capture 05/21] 05_complaint_submission.png...');
  await page.goto(`${BASE_URL}/user/submit-complaint`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('input[name="title"]');
  await page.type('input[name="title"]', 'Air Conditioning Unit in Compilers Lab 2 Leaking Water', { delay: 5 });
  await page.select('select[name="priority"]', 'HIGH');
  await page.type(
    'textarea[name="description"]',
    'The ceiling AC unit above workstation row 3 is dripping condensation directly onto the CPU benches. Immediate technician dispatch is requested to service the drainage tray and avoid hardware short-circuits.',
    { delay: 5 }
  );
  await page.type('input[name="contactAddress"]', 'Computer Science Block, 2nd Floor, Lab 2', { delay: 5 });
  await sleep(600);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05_complaint_submission.png') });

  // ----------------------------------------------------
  // 06. My Complaints Listing Page
  // ----------------------------------------------------
  console.log('[Capture 06/21] 06_my_complaints.png...');
  await page.goto(`${BASE_URL}/user/my-complaints`, { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_my_complaints.png') });

  // ----------------------------------------------------
  // 07. Complaint Details & Status History
  // ----------------------------------------------------
  console.log('[Capture 07/21] 07_complaint_details_history.png...');
  await page.goto(`${BASE_URL}/complaints/6ae0bd9ab50033f495d19400`, { waitUntil: 'networkidle0' });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07_complaint_details_history.png') });

  // ----------------------------------------------------
  // 08. Complaint Messaging Interface
  // ----------------------------------------------------
  console.log('[Capture 08/21] 08_complaint_messaging.png...');
  await page.evaluate(() => {
    const chatCard = document.querySelector('.card.border-0.shadow-sm.rounded-3.h-100');
    if (chatCard) chatCard.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(600);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '08_complaint_messaging.png') });

  // ----------------------------------------------------
  // 09. Notifications Dropdown
  // ----------------------------------------------------
  console.log('[Capture 09/21] 09_notifications.png...');
  await page.goto(`${BASE_URL}/user/dashboard`, { waitUntil: 'networkidle0' });
  await sleep(800);
  const bell = await page.$('button[title="Notifications"]');
  if (bell) {
    await bell.click();
    await sleep(800);
  }
  await page.screenshot({ path: path.join(OUTPUT_DIR, '09_notifications.png') });

  // ----------------------------------------------------
  // 10. User Profile Page
  // ----------------------------------------------------
  console.log('[Capture 10/21] 10_user_profile.png...');
  await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle0' });
  await sleep(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '10_user_profile.png') });

  // ----------------------------------------------------
  // 11. Agent Dashboard
  // ----------------------------------------------------
  console.log('[Capture 11/21] 11_agent_dashboard.png...');
  await performLogout(page);
  await performLogin(page, 'agent.sarah@complaintportal.com', 'Agent@12345');
  await page.goto(`${BASE_URL}/agent/dashboard`, { waitUntil: 'networkidle0' });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '11_agent_dashboard.png') });

  // ----------------------------------------------------
  // 12. Agent Complaint Details & Resolution Controls
  // ----------------------------------------------------
  console.log('[Capture 12/21] 12_agent_complaint_details.png...');
  await page.goto(`${BASE_URL}/agent/complaints/6ae0bd9ab50033f495d19400`, { waitUntil: 'networkidle0' });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '12_agent_complaint_details.png') });

  // ----------------------------------------------------
  // 13. Administrator Dashboard
  // ----------------------------------------------------
  console.log('[Capture 13/21] 13_admin_dashboard.png...');
  await performLogout(page);
  await performLogin(page, 'admin@complaintportal.com', 'Admin@12345');
  await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle0' });
  await sleep(1500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '13_admin_dashboard.png') });

  // ----------------------------------------------------
  // 14. Administrator's Complaint Listing
  // ----------------------------------------------------
  console.log('[Capture 14/21] 14_admin_complaints.png...');
  await page.goto(`${BASE_URL}/admin/complaints`, { waitUntil: 'networkidle0' });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '14_admin_complaints.png') });

  // ----------------------------------------------------
  // 15. Complaint Assignment Modal Overlay
  // ----------------------------------------------------
  console.log('[Capture 15/21] 15_complaint_assignment.png...');
  const assignBtn = await page.$('button[title="Assign to Agent"]');
  if (assignBtn) {
    await assignBtn.click();
    await sleep(800);
  }
  await page.screenshot({ path: path.join(OUTPUT_DIR, '15_complaint_assignment.png') });
  await page.keyboard.press('Escape');
  await sleep(400);

  // ----------------------------------------------------
  // 16. User Management Page
  // ----------------------------------------------------
  console.log('[Capture 16/21] 16_user_management.png...');
  await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle0' });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '16_user_management.png') });

  // ----------------------------------------------------
  // 17. Category / Agent Management Page
  // ----------------------------------------------------
  console.log('[Capture 17/21] 17_agent_management.png...');
  await page.goto(`${BASE_URL}/admin/categories`, { waitUntil: 'networkidle0' });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '17_agent_management.png') });

  // ----------------------------------------------------
  // 18. Complaint Feedback / Rating Interface
  // ----------------------------------------------------
  console.log('[Capture 18/21] 18_feedback_rating.png...');
  await page.goto(`${BASE_URL}/complaints/6ae0bd9ab50033f495d19405`, { waitUntil: 'networkidle0' });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '18_feedback_rating.png') });

  // ----------------------------------------------------
  // 19. Admin Reports & Feedback Management
  // ----------------------------------------------------
  console.log('[Capture 19/21] 19_admin_reports.png...');
  await page.goto(`${BASE_URL}/admin/feedback`, { waitUntil: 'networkidle0' });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '19_admin_reports.png') });

  // ----------------------------------------------------
  // 20. Access Denied / Security Shield Page
  // ----------------------------------------------------
  console.log('[Capture 20/21] 20_validation_or_access_denied.png...');
  await page.goto(`${BASE_URL}/unauthorized`, { waitUntil: 'networkidle0' });
  await sleep(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '20_validation_or_access_denied.png') });

  // ----------------------------------------------------
  // 21. Mobile Responsive View
  // ----------------------------------------------------
  console.log('[Capture 21/21] 21_mobile_responsive.png...');
  await setViewportMobile(page);
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '21_mobile_responsive.png') });

  await browser.close();
  console.log('====================================================');
  console.log('  ALL 21 SCREENSHOTS SUCCESSFULLY CAPTURED TO DISK  ');
  console.log('====================================================');
}

capture()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Screenshot capture failure:', err);
    process.exit(1);
  });
