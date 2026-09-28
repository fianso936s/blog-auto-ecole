import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

// Run only against a local preview, with API fixtures and no outgoing mutations.
const origin = 'http://127.0.0.1:4173';
mkdirSync('quality', { recursive: true });
const results = [];
const browser = await chromium.launch({ headless: true });
const fixture = { id: 'qa-only', title: 'Guide QA — conduite', slug: 'guide-qa', excerpt: 'Contenu de test isolé, jamais publié.', content: '<h2>Repères de test</h2><p>Texte conservé.</p><script>window.qaAttack=true</script><a href="javascript:window.qaAttack=true">Lien rejeté</a><img src="javascript:window.qaAttack=true" onerror="window.qaAttack=true">', cover_image: '', category: 'Conduite', author: 'Fixture locale', created_at: '2026-09-01T12:00:00Z', updated_at: '2026-09-01T12:00:00Z', published: true };
async function ready() {
  for (let attempt = 0; attempt < 50; attempt++) {
    try { const response = await fetch(origin); if (response.ok) return; } catch { /* Wait for preview. */ }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error('Local Vite preview did not start');
}
async function context(options = {}) {
  const ctx = await browser.newContext(options);
  const blockedWrites = [];
  await ctx.route('**/*', async route => {
    const request = route.request(); const url = new URL(request.url());
    if (!['GET', 'HEAD'].includes(request.method())) { blockedWrites.push(request.url()); await route.abort(); return; }
    if (url.origin === origin) { await route.continue(); return; }
    if (url.hostname.endsWith('.supabase.co')) {
      const slug = url.searchParams.get('slug');
      const body = url.pathname.includes('/articles') ? (slug ? (slug === 'eq.guide-qa' ? fixture : { message: 'Not found' }) : [fixture]) : [];
      await route.fulfill({ status: slug && slug !== 'eq.guide-qa' ? 404 : 200, contentType: 'application/json', body: JSON.stringify(body) }); return;
    }
    await route.abort(); // No external fonts/images/tracking in isolated acceptance.
  });
  return { ctx, blockedWrites };
}
try {
  await ready();
  for (const width of [320, 390, 768, 1440]) {
    const { ctx, blockedWrites } = await context({ viewport: { width, height: 900 }, reducedMotion: 'reduce', colorScheme: 'light' });
    const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let expectedFont;
    for (const path of ['/', '/blog', '/blog/articles', '/blog/quiz']) {
      await page.goto(origin + path); await page.locator('h1').first().waitFor();
      assert.equal(await page.locator('.site-header').count(), 1);
      assert.equal(await page.locator('.site-footer').count(), 1);
      assert.equal(await page.locator('main').count(), 1);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow ${width} ${path}`);
      const font = await page.locator('h1').first().evaluate(element => getComputedStyle(element).fontFamily);
      expectedFont ||= font; assert.equal(font, expectedFont);
      if (width === 390 || width === 1440) await page.screenshot({ path: `quality/view-${width}-${path.replaceAll('/', '-') || 'home'}.png`, fullPage: true });
      results.push({ test: 'shell-typography-overflow', width, path, pass: true, note: 'Fallback font used; remote font requests blocked in this isolated test.' });
    }
    await page.goto(origin + '/');
    await page.getByLabel('13 heures', { exact: true }).check();
    assert.ok((await page.locator('.wd-price').first().innerText()).includes('890'));
    if (width < 1100) {
      await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
      assert.equal(await page.locator('#site-mobile-menu').evaluate(element => element.open), true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#site-mobile-menu').evaluate(element => element.open), false);
      await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
      await page.getByRole('navigation', { name: 'Navigation mobile', exact: true }).getByRole('link', { name: 'Blog & guides' }).click();
      await page.waitForURL('**/blog');
    } else {
      await page.getByRole('navigation', { name: 'Navigation principale', exact: true }).getByRole('link', { name: 'Blog & guides' }).click();
      await page.waitForURL('**/blog');
    }
    await page.goto(origin + '/articles?cat=conduite'); await page.waitForURL('**/blog/articles?cat=conduite');
    await page.goto(origin + '/blog/articles/guide-qa');
    await page.getByRole('heading', { name: 'Guide QA — conduite', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.qaAttack), undefined);
    assert.equal(await page.locator('.prose script,.prose [onerror],.prose a[href^="javascript:"]').count(), 0);
    await page.goto(origin + '/blog/articles/unknown-qa'); await page.getByRole('heading', { name: 'Article introuvable' }).waitFor();
    assert.equal(blockedWrites.length, 0, 'A browser path attempted a write');
    assert.deepEqual(errors, [], 'Uncaught browser error');
    results.push({ test: 'menu-prices-legacy-routing-editorial-renderer', width, pass: true });
    await ctx.close();
  }
  const { ctx } = await context({ viewport: { width: 390, height: 844 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(origin + '/'); await page.locator('h1').waitFor();
  const home = await page.evaluate(() => ({ background: getComputedStyle(document.body).backgroundColor, font: getComputedStyle(document.querySelector('h1')).fontFamily }));
  await page.goto(origin + '/blog'); await page.locator('h1').waitFor();
  const blog = await page.evaluate(() => ({ background: getComputedStyle(document.body).backgroundColor, font: getComputedStyle(document.querySelector('h1')).fontFamily }));
  assert.deepEqual(home, blog); results.push({ test: 'shared-dark-theme', pass: true });
  await ctx.close();
} catch (error) {
  results.push({ pass: false, error: error.message }); process.exitCode = 1;
} finally {
  writeFileSync('quality/browser-results.json', JSON.stringify({ scope: 'local-preview-with-fixtures', results }, null, 2));
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}
