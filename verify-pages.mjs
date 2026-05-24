import { chromium } from 'playwright';

const BASE  = process.env.SITE_URL  || 'http://127.0.0.1:8080';
const EMAIL = process.env.SUPABASE_TEST_EMAIL    || 'executive_director@nonprofitai.software';
const PASS  = process.env.SUPABASE_TEST_PASSWORD || 'Demo@123';

const pages = [
  { name: 'membership',         path: '/membership' },
  { name: 'volunteers',         path: '/volunteers' },
  { name: 'event-management',   path: '/event-management' },
  { name: 'donations',          path: '/donations' },
  { name: 'public-presence',    path: '/public-presence' },
  { name: 'impact-dashboard',   path: '/impact-dashboard' },
  { name: 'engagement-scoring', path: '/engagement-scoring' },
];

const log = (...args) => console.log('[verify]', ...args);

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // ── Login ─────────────────────────────────────────────────────────────
  log('→ loading login page');
  await page.goto(BASE + '/login', { waitUntil: 'networkidle', timeout: 20000 });
  await page.screenshot({ path: '/tmp/ss-00-login.png' });
  log('  login page loaded');

  // fill email
  const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="mail" i]';
  await page.waitForSelector(emailSel, { timeout: 10000 });
  await page.fill(emailSel, EMAIL);

  // fill password
  const passSel = 'input[type="password"]';
  await page.waitForSelector(passSel, { timeout: 5000 });
  await page.fill(passSel, PASS);

  // submit
  const submitSel = 'button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), button:has-text("Log in")';
  await page.click(submitSel);
  log('  submitted login form');

  // wait for redirect to dashboard
  try {
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    log('  ✅ authenticated → dashboard');
  } catch {
    await page.screenshot({ path: '/tmp/ss-00-login-fail.png' });
    log('  ⚠️  login may not have redirected — current URL:', page.url());
    // some apps redirect to / which then shows dashboard
  }
  await page.screenshot({ path: '/tmp/ss-01-dashboard.png' });

  // ── Visit each new page ────────────────────────────────────────────────
  const results = [];

  for (const { name, path } of pages) {
    log(`→ navigating to ${path}`);
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500); // let React render
    const url = page.url();
    const title = await page.title();

    // Check not redirected to login (would mean auth failed / route missing)
    const redirectedToLogin = url.includes('/login') || url === BASE + '/';

    // Look for the page heading (h1)
    let h1 = '';
    try {
      h1 = await page.locator('h1').first().innerText({ timeout: 3000 });
    } catch { h1 = '(no h1)'; }

    // Look for error states
    let hasError = false;
    try {
      const errorText = await page.locator('text=/error|not found|404|failed/i').count();
      hasError = errorText > 0 && redirectedToLogin === false;
    } catch {}

    const status = redirectedToLogin ? '❌ REDIRECTED_TO_LOGIN' : hasError ? '⚠️ PAGE_ERROR' : '✅ OK';
    log(`  ${status} — url: ${url} | h1: "${h1}"`);
    results.push({ name, path, status, url, h1, redirectedToLogin });

    await page.screenshot({ path: `/tmp/ss-${name}.png` });
  }

  // ── Tab interaction: Membership directory tab ─────────────────────────
  log('→ probing Membership tab interactions');
  await page.goto(BASE + '/membership', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);
  // Click "Renewals" tab
  try {
    await page.getByRole('tab', { name: /renewals/i }).click();
    await page.waitForTimeout(800);
    const renewalsContent = await page.locator('[data-state="active"]').textContent({ timeout: 3000 });
    log('  Renewals tab content snippet:', renewalsContent?.slice(0, 80));
    await page.screenshot({ path: '/tmp/ss-membership-renewals-tab.png' });
  } catch (e) { log('  ⚠️ renewals tab probe failed:', e.message); }

  // ── Probe: row click → Sheet on Membership ────────────────────────────
  try {
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.click({ timeout: 5000 });
    await page.waitForTimeout(800);
    const sheet = page.locator('[role="dialog"], [data-vaul-drawer], aside');
    const sheetVisible = await sheet.first().isVisible().catch(() => false);
    log(`  Member detail Sheet visible after row click: ${sheetVisible}`);
    await page.screenshot({ path: '/tmp/ss-membership-sheet.png' });
  } catch (e) { log('  ⚠️ sheet probe failed:', e.message); }

  // ── Probe: frequency filter on Donations page ─────────────────────────
  log('→ probing Donations frequency filter');
  await page.goto(BASE + '/donations', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);
  try {
    // Click the Donations tab first
    await page.getByRole('tab', { name: /donations/i }).click();
    await page.waitForTimeout(800);
    // Click "Monthly" filter
    await page.getByRole('button', { name: /monthly/i }).click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: '/tmp/ss-donations-monthly-filter.png' });
    log('  Monthly filter applied — screenshot saved');
  } catch (e) { log('  ⚠️ donations filter probe failed:', e.message); }

  // ── Probe: Public Presence switches ──────────────────────────────────
  log('→ probing Public Presence switch toggle');
  await page.goto(BASE + '/public-presence', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);
  try {
    const switchEl = page.locator('[role="switch"]').first();
    const before = await switchEl.getAttribute('data-state');
    await switchEl.click();
    await page.waitForTimeout(500);
    const after = await switchEl.getAttribute('data-state');
    log(`  Switch toggled: ${before} → ${after}`);
    await page.screenshot({ path: '/tmp/ss-public-presence-toggle.png' });
  } catch (e) { log('  ⚠️ switch probe failed:', e.message); }

  // ── Probe: AI Engagement Scoring sheet ───────────────────────────────
  log('→ probing AI Engagement Scoring member detail');
  await page.goto(BASE + '/engagement-scoring', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);
  try {
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/ss-engagement-sheet.png' });
    log('  Engagement scoring member sheet captured');
  } catch (e) { log('  ⚠️ engagement sheet probe failed:', e.message); }

  // ── Probe: Create Event dialog on Event Management ────────────────────
  log('→ probing Event Management create dialog');
  await page.goto(BASE + '/event-management', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);
  try {
    await page.getByRole('button', { name: /new event/i }).click();
    await page.waitForTimeout(800);
    const dialog = page.locator('[role="dialog"]');
    const dialogVisible = await dialog.first().isVisible().catch(() => false);
    log(`  Create Event dialog visible: ${dialogVisible}`);
    await page.screenshot({ path: '/tmp/ss-event-mgmt-dialog.png' });
  } catch (e) { log('  ⚠️ event dialog probe failed:', e.message); }

  // ── Summary ───────────────────────────────────────────────────────────
  console.log('\n── RESULTS ──────────────────────');
  for (const r of results) {
    console.log(`${r.status}  ${r.path}  →  "${r.h1}"`);
  }
  const failed = results.filter(r => r.redirectedToLogin);
  console.log(`\nPages failed auth/route: ${failed.length}`);
  console.log('Screenshots in /tmp/ss-*.png');

  await browser.close();
  if (failed.length > 0) process.exit(1);
})();
