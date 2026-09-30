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
  const legacyScene = read('src/components/RoadScene.tsx');
  for (const marker of ['visibilitychange', 'IntersectionObserver', 'ResizeObserver', 'cancelAnimationFrame', 'Math.round']) assert.ok(legacyScene.includes(marker));
  const experience = read('src/features/experience3d/Experience3D.tsx');
  for (const marker of ['prefers-reduced-motion', 'visibilitychange', 'IntersectionObserver', 'ResizeObserver']) assert.ok(experience.includes(marker), marker);
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


test('Shared mobile navigation and footer keep route hierarchy usable at narrow widths', () => {
  const header = read('src/components/Header.tsx');
  const footer = read('src/components/Footer.tsx');
  const styles = read('src/styles/brand.css');
  for (const marker of ['site-mobile-overline', 'site-mobile-link-label', 'String(index + 1).padStart(2, "0")']) assert.ok(header.includes(marker), marker);
  for (const marker of ['site-footer-head', 'site-footer-route', 'aria-label="Repères du parcours"', 'to="/#budget"', 'WEBEDRIVE · VOTRE PARCOURS']) assert.ok(footer.includes(marker), marker);
  for (const marker of ['overscroll-behavior: contain', 'env(safe-area-inset-top)', 'grid-template-columns: repeat(2,minmax(0,1fr))', '.site-footer summary::after', '@media(max-width:380px)', '.site-footer-grid nav {']) assert.ok(styles.includes(marker), marker);
  assert.ok(!styles.includes('.site-footer nav {'), 'route rail must not inherit column nav layout');
});


test('Shared header height keeps journal navigation aligned', () => {
  const brand = read('src/styles/brand.css');
  const blog = read('src/styles/refinement-blog.css');
  assert.ok(brand.includes('--wd-header-height: 84px'));
  assert.ok(brand.includes('--wd-header-height: 76px'));
  assert.ok(blog.includes('top:var(--wd-header-height)'));
  assert.ok(blog.includes('article-detail-actions'));
});

test('Ribbon experience uses one accessible poster fallback and a deferred 3D runtime', () => {
  const landing = read('src/pages/WebedriveLanding.tsx');
  const experience = read('src/features/experience3d/Experience3D.tsx');
  const scene = read('src/features/experience3d/runtime/createScene.ts');
  for (const marker of ['id="experience"', 'Experience3D', 'Un planning qui s’organise avec vous.', 'Des acquis. Un prochain objectif.']) assert.ok(landing.includes(marker), marker);
  for (const marker of ['prefers-reduced-motion', 'saveData', 'webgl2Available', 'Explorer en 3D', 'Désactiver l’animation', 'IntersectionObserver', 'webglcontextlost']) assert.ok(experience.includes(marker), marker);
  for (const marker of ['CatmullRomCurve3', 'CarRoot', 'RoadSurface', 'Wheel_FL', 'ACESFilmicToneMapping', 'setAnimationLoop']) assert.ok(scene.includes(marker), marker);
});

test('3D contracts and deterministic story reference stay versioned with the site', () => {
  for (const path of ['contracts/scene.config.json', 'contracts/performance-budgets.json', 'reference/scene-math.mjs', 'reference/scene-math.test.mjs']) {
    assert.ok(read(path).length > 100, path);
  }
  const scene = JSON.parse(read('contracts/scene.config.json'));
  assert.equal(scene.car.dimensions.length, 4.05);
  assert.equal(scene.road.width, 3.4);
  assert.equal(scene.anchors.length, 5);
});


test('Mobile 3D stage stays singular and adds a compact journey rail', () => {
  const landing = read('src/pages/WebedriveLanding.tsx');
  const experience = read('src/features/experience3d/Experience3D.tsx');
  const styles = read('src/features/experience3d/experience3d.css');
  assert.ok(!landing.includes('import ExperiencePoster from "../features/experience3d/ExperiencePoster";'));
  assert.ok(!landing.includes('<div className="wd-experience-mobile-poster">'));
  for (const marker of [
    'wd-experience-shell',
    '<ExperiencePoster variant={mobile ? "mobile" : "desktop"} />',
    'wd-experience-journey-rail',
    'Les trois étapes du parcours',
    '<strong>Comprendre</strong>',
    '<strong>Organiser</strong>',
    '<strong>Avancer</strong>'
  ]) assert.ok(experience.includes(marker), marker);
  for (const marker of [
    '.wd-experience-shell {',
    '.wd-experience-journey-rail {',
    'grid-template-columns: repeat(3, minmax(0, 1fr));',
    '.wd-experience-visual {\n    display: block;\n    order: 2;'
  ]) assert.ok(styles.includes(marker), marker);
});


test('3D visual controls stay reversible and poster labelling stays singular', () => {
  const experience = read('src/features/experience3d/Experience3D.tsx');
  const poster = read('src/features/experience3d/ExperiencePoster.tsx');
  const styles = read('src/features/experience3d/experience3d.css');
  assert.ok(experience.includes('aria-busy={status === "loading"}'));
  assert.ok(experience.includes('cleanupScene(); setStatus("poster")'));
  assert.ok(!experience.includes('const [disabled, setDisabled]'));
  assert.ok(poster.includes('aria-hidden="true"'));
  assert.ok(!poster.includes('role="img"'));
  assert.ok(styles.includes('.wd-experience-webgl {'));
  assert.ok(styles.includes('inset: 0;'));
  assert.ok(styles.includes('background: rgb(9 36 53 / .74)'));
});
