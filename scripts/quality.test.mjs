import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
const read = path => readFileSync(path, 'utf8');
const load = path => {
  const code = ts.transpileModule(read(path), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {}; vm.runInNewContext(code, { exports, module: { exports } }); return exports;
};
const nav = load('src/lib/navigation.ts');
const offers = load('src/lib/offers.ts');
const files = folder => readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(`${folder}/${entry.name}`) : [`${folder}/${entry.name}`]);

test('All four approved prices and the 200 euro rhythm difference', () => {
  assert.equal(offers.PRICES[13].classic, 890); assert.equal(offers.PRICES[13].accelerated, 1090);
  assert.equal(offers.PRICES[20].classic, 1290); assert.equal(offers.PRICES[20].accelerated, 1490);
  for (const hours of [13, 20]) assert.equal(offers.PRICES[hours].accelerated - offers.PRICES[hours].classic, 200);
});
test('Approved inclusions and additional fees are retained', () => {
  assert.equal(offers.EXTRA_HOUR_PRICE, 65); assert.equal(offers.CODE_EXAM_PRICE, 30); assert.equal(offers.INCLUDED.length, 5);
  assert.match(offers.INCLUDED.join(' '), /6 mois/); assert.match(offers.INCLUDED.join(' '), /en plus/);
});
test('Category accents, whitespace and punctuation use one normalizer', () => {
  assert.equal(nav.categorySlug('Sécurité Routière'), 'securite-routiere');
  assert.equal(nav.categorySlug('  Code de la route  '), 'code-de-la-route');
  assert.equal(nav.categorySlug('Conduite'), 'conduite');
});
test('Article links stay within the blog and encode their slug', () => {
  assert.equal(nav.articlePath('mon-permis'), '/blog/articles/mon-permis');
  assert.equal(nav.articlePath('../?x'), '/blog/articles/..%2F%3Fx');
});
test('Menu distinguishes home, anchors, blog and quiz', () => {
  assert.equal(nav.isNavigationActive('/', '', '/'), true);
  assert.equal(nav.isNavigationActive('/', '#formules', '/'), false);
  assert.equal(nav.isNavigationActive('/', '#formules', '/#formules'), true);
  assert.equal(nav.isNavigationActive('/blog/articles/test', '', '/blog'), true);
  assert.equal(nav.isNavigationActive('/blog/quiz', '', '/blog'), false);
  assert.equal(nav.isNavigationActive('/blog/quiz', '', '/blog/quiz'), true);
  assert.equal(nav.MAIN_NAV.length, 5);
});
test('Root landing stays outside the blog layout', () => {
  const app = read('src/App.tsx');
  assert.ok(app.indexOf('path="/" element={<WebedriveLanding') < app.indexOf('element={<PublicLayout'));
  for (const path of ['/blog', '/blog/articles', '/blog/articles/:slug', '/blog/quiz', '/eleve', '/admin']) assert.ok(app.includes(`path="${path}"`));
});
test('Root and blog import the same header and footer, without duplicated legacy wrappers', () => {
  for (const path of ['src/pages/WebedriveLanding.tsx', 'src/layouts/PublicLayout.tsx']) {
    const source = read(path); assert.ok(source.includes('<Header />')); assert.ok(source.includes('<Footer />')); assert.ok(source.includes('id="site-content"'));
  }
  assert.ok(!read('src/pages/WebedriveLanding.tsx').includes('wd-brand'));
});
test('Legacy URLs preserve search and hash on redirect', () => {
  const source = read('src/components/LegacyBlogRedirect.tsx');
  assert.ok(source.includes('${pathname}${search}${hash}')); assert.ok(source.includes('<Navigate replace'));
});
test('Mobile menu has native modality, labels, close and route handling', () => {
  const source = read('src/components/Header.tsx');
  for (const marker of ['<dialog', 'showModal()', 'aria-expanded', 'aria-controls', 'onClose', 'location.key', 'Fermer le menu']) assert.ok(source.includes(marker));
});
test('Metadata uses WEBEDRIVE and no placeholder canonical', () => {
  const html = read('index.html'); assert.ok(!html.includes('example.com')); assert.ok(!html.includes('/vite.svg'));
  assert.ok(html.includes('family=Manrope')); assert.ok(!/family=(Syne|Outfit)/.test(html));
  assert.ok(read('src/components/PageMeta.tsx').includes('| WEBEDRIVE'));
  assert.ok(read('src/pages/WebedriveLanding.tsx').includes('noIndex'));
});
test('Shared tokens replace terracotta and diverging typography', () => {
  const css = read('src/index.css') + read('src/styles/brand.css');
  assert.ok(!/#D64327|#E8654A|#FEF0EC|Syne|Outfit/i.test(css));
  for (const hex of ['#153D58', '#F6F3ED', '#D7B98E', '#172D3A']) assert.ok(css.includes(hex));
  assert.ok(css.includes('--font-sans: var(--wd-font)')); assert.ok(css.includes('--font-serif: var(--wd-font)'));
});
test('Measured solid text colour pairs pass 4.5:1', () => {
  const luminance = hex => { const rgb = hex.match(/[a-f0-9]{2}/gi).map(value => parseInt(value,16)/255).map(value => value<=.04045 ? value/12.92 : ((value+.055)/1.055)**2.4); return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722; };
  for (const [a,b] of [['526774','F6F3ED'],['172D3A','F6F3ED'],['F6F3ED','153D58'],['B4C1CA','0F2431'],['D7E2E8','153D58'],['71542C','F6F3ED']]) {
    const [low,high] = [luminance(a),luminance(b)].sort((x,y)=>x-y); assert.ok((high+.05)/(low+.05)>=4.5, `${a}/${b}`);
  }
});
test('Raster logo is present, intact and no font files are published', () => {
  const logo = readFileSync('public/brand/webedrive.png');
  assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${logo.length}\0`), logo])).digest('hex'), 'e25fc561073a101287ad4208337851703b7823de');
  assert.equal(files('public').filter(path => /\.(woff2?|ttf|otf|eot)$/i.test(path)).length, 0);
});
test('Article detail resets stale state and queries published content only', () => {
  const source = read('src/pages/public/ArticleDetailPage.tsx');
  assert.ok(source.includes('setArticle(null)')); assert.ok(source.includes('.eq("published", true)')); assert.ok(source.includes('cancelled = true'));
});
test('Public article HTML is rendered as constrained React nodes, not raw HTML', () => {
  const detail = read('src/pages/public/ArticleDetailPage.tsx'); const body = read('src/components/ArticleBody.tsx');
  assert.ok(!detail.includes('dangerouslySetInnerHTML')); assert.ok(!body.includes('dangerouslySetInnerHTML'));
  for (const marker of ['DROP.has(tag)', 'safeUrl', 'createElement', '15000', 'depth > 40']) assert.ok(body.includes(marker));
});
test('Newsletter has a permanent label and honest error/success states', () => {
  const source = read('src/components/Newsletter.tsx');
  for (const marker of ['htmlFor', 'aria-invalid', 'role="alert"', 'role="status"', 'insertError', 'email.trim()']) assert.ok(source.includes(marker));
});
test('Footer contains no invented phone/email or misleading legal links', () => {
  const source = read('src/components/Footer.tsx'); assert.ok(!/01 23 45 67 89|contact@auto-blog\.fr/.test(source));
  assert.ok(source.includes('restent à valider')); assert.ok(!source.includes('Politique de confidentialit'));
});
test('Animation lifecycle declares visibility, resize and reduced-motion handling', () => {
  const scene = read('src/components/RoadScene.tsx');
  for (const marker of ['visibilitychange', 'IntersectionObserver', 'ResizeObserver', 'cancelAnimationFrame', 'Math.round']) assert.ok(scene.includes(marker));
  assert.ok(read('src/pages/WebedriveLanding.tsx').includes('prefers-reduced-motion'));
});
test('All application TypeScript and TSX files parse without syntax errors', () => {
  const sources = files('src').filter(path => /\.tsx?$/.test(path) && !path.endsWith('.d.ts'));
  for (const path of sources) {
    const output = ts.transpileModule(read(path), { fileName: path, reportDiagnostics: true, compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
    const errors = (output.diagnostics || []).filter(item => item.category === ts.DiagnosticCategory.Error);
    assert.equal(errors.length, 0, `${path}: ${errors.map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')).join(';')}`);
  }
});


test('Budget estimator uses the approved local fee model', () => {
  const landing = read('src/pages/WebedriveLanding.tsx');
  for (const marker of ['extraHours * EXTRA_HOUR_PRICE', 'codeAttempts * CODE_EXAM_PRICE', 'classicTotal', 'acceleratedTotal', 'Estimation locale uniquement']) {
    assert.ok(landing.includes(marker), marker);
  }
});

test('Blog fallback content is visibly identified as demonstration material', () => {
  const home = read('src/pages/public/HomePage.tsx');
  for (const marker of ['contentSource', 'setContentSource("live")', 'Aperçu éditorial', 'exemples de démonstration']) {
    assert.ok(home.includes(marker), marker);
  }
});


test('Public quiz uses the shared shuffle helper and accessible fallback states', () => {
  const quiz = read('src/pages/public/QuizPage.tsx');
  assert.ok(quiz.includes('shuffleCopy(filtered)'));
  assert.ok(!quiz.includes('sort(() => Math.random()'));
  assert.ok((quiz.match(/noIndex/g) || []).length >= 4);
  assert.ok(quiz.includes('role={loadError ? "alert" : undefined}'));
  assert.ok(quiz.includes('Revenir à toutes les catégories'));
  assert.ok(quiz.includes('Explication enregistrée dans le contenu pédagogique du quiz.'));
});

test('shuffleCopy is deterministic with an injected source and does not mutate input', () => {
  const helper = load('src/lib/quiz.ts');
  const source = [1, 2, 3];
  const shuffled = helper.shuffleCopy(source, () => 0);
  assert.deepEqual(source, [1, 2, 3]);
  assert.deepEqual(Array.from(shuffled), [2, 3, 1]);
});


test('Landing comparison keeps the selected volume visible into the budget step', () => {
  const landing = read('src/pages/WebedriveLanding.tsx');
  for (const marker of ['wd-comparison-intro', 'Comparaison des formules pour', 'wd-budget-bridge', 'Étape suivante', 'h sélectionnées']) {
    assert.ok(landing.includes(marker), marker);
  }
});


test('Landing closes with an accessible journal handoff and a route back to offers', () => {
  const landing = read('src/pages/WebedriveLanding.tsx');
  for (const marker of ['aria-labelledby="journal-title"', 'wd-closing-topics', 'wd-closing-actions', 'to="/blog"', 'to="/#formules"', 'Explorer le journal', 'Revoir les formules']) {
    assert.ok(landing.includes(marker), marker);
  }
});


test('Offer cards hand their selected rhythm into the budget simulator', () => {
  const landing = read('src/pages/WebedriveLanding.tsx');
  for (const marker of [
    'type Plan = "classic" | "accelerated"',
    'name="budget-plan"',
    'onClick={() => onSelect(plan)}',
    'selected={plan === "classic"}',
    'selected={plan === "accelerated"}',
    'data-active={plan === "classic"',
    'data-active={plan === "accelerated"',
    'selectedPlanLabel'
  ]) {
    assert.ok(landing.includes(marker), marker);
  }
});


test('Landing keeps the simulated journey visible through the method handoff', () => {
  const landing = read('src/pages/WebedriveLanding.tsx');
  const styles = read('src/styles/editorial.css');
  for (const marker of ['wd-method-context', 'Parcours simulé', 'Estimation actuelle', 'selectedTotal.toLocaleString("fr-FR")', 'Ajuster le budget']) {
    assert.ok(landing.includes(marker), marker);
  }
  assert.ok(styles.includes('.wd-question-list summary:focus-visible'));
  assert.ok(styles.includes('.wd-site .wd-method .wd-steps article::before'));
});


test('FAQ and journal handoff stay dense and operable on narrow screens', () => {
  const styles = read('src/styles/editorial.css');
  for (const marker of [
    'counter-reset: wd-question',
    'counter(wd-question, decimal-leading-zero)',
    '.wd-question-list details[open]>summary',
    'grid-template-columns: minmax(0,1.18fr) minmax(270px,.72fr)',
    '.wd-closing-actions',
    '.wd-closing-secondary:focus-visible',
    '.wd-question-list details>p { padding: 0 30px 20px 36px;',
    '.wd-closing-actions { width: 100%;'
  ]) assert.ok(styles.includes(marker), marker);
});
