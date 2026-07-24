'use strict';
/**
 * Genera una copia obfuscada de todo el código propio en dist/.
 * dist/ es lo ÚNICO que debería pushearse al repo público — la fuente
 * real (Sebastool/, plugins/, events/, main.js, etc.) se queda siempre
 * en el repo privado.
 *
 * Uso:
 *   node scripts/build-obfuscated.js
 *
 * Después de correrlo:
 *   cd dist && npm install --omit=dev   (para chequear que instala/levanta bien)
 *   node dist/index.js                  (smoke test antes de pushear)
 */

const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// ---------------------------------------------------------------------
// Qué es código propio (pasa por el obfuscator) y qué se copia tal cual.
// ---------------------------------------------------------------------

// Código propio: entra al obfuscator.
const JS_TARGETS = [
  'main.js',
  'index.js',
  'botHandler.js',
  'config.js',
  'Sebastool',
  'plugins',
  'events',
];

// Se copia sin tocar: assets, datos, dependencias externas (fork de Baileys),
// y utilidades de infraestructura que puede necesitar leerse en texto plano
// en el hosting (ej. si el panel te pide abrir un script para debuggear).
const COPY_AS_IS = [
  'package.json',
  'data',
  'media',
  'scripts',
  'vendor',
];

// Nunca entra a dist bajo ningún concepto.
const EXCLUDE = new Set(['node_modules', '.git', 'dist', '.env', 'session']);

// ---------------------------------------------------------------------
// Perfiles de obfuscation.
//
// "hot"   -> corre en CADA mensaje entrante (router, entrypoints, eventos
//            de baileys). Priorizamos que no meta latencia perceptible.
// "heavy" -> el resto: lógica de negocio real (plugins, economía, gacha,
//            cooldowns, config de APIs). Acá metemos todo el arsenal.
// ---------------------------------------------------------------------

const HOT_FILES = new Set([
  'main.js',
  'index.js',
  'botHandler.js',
  path.join('Sebastool', 'msgRouter.js'),
  path.join('Sebastool', 'core.js'),
]);
const HOT_DIRS = new Set(['events']);

const HOT_PROFILE = {
  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.5,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  selfDefending: false, // rompe bien con hot-reload de plugins, no vale la pena acá
  transformObjectKeys: false, // CRÍTICO — ver nota abajo
  disableConsoleOutput: false,
};

const HEAVY_PROFILE = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  stringArray: true,
  stringArrayEncoding: ['rc4'],
  stringArrayThreshold: 1,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  selfDefending: false, // ver nota abajo: causaba cuelgues reales al re-requerir el módulo
  transformObjectKeys: false, // CRÍTICO — ver nota abajo
  disableConsoleOutput: false,
};

// NOTA sobre selfDefending:
// En teoría suma protección (el código se "defiende" si lo reformateas), pero
// en la práctica cuelga el proceso cuando el módulo se vuelve a requerir o se
// evalúa en un contexto distinto al de la primera ejecución (justo lo que pasa
// con require.cache-delete en el reload de plugins, o al testear un archivo
// suelto). Lo probamos contra este proyecto y colgó Node de verdad — por eso
// queda en false en los dos perfiles. El resto de las protecciones (control
// flow flattening + string array rc4 + dead code) ya hacen el trabajo pesado
// sin ese riesgo.

// NOTA sobre transformObjectKeys:
// Cada archivo se obfusca por separado (uno por uno), no como bundle único.
// El loader de plugins lee `plugin.command`, `.run`, `.tags`, `.cases`,
// `.handler`, `.name`, etc. definidos en OTRO archivo. Si transformObjectKeys
// anduviera activo, cada archivo renombraría esas keys de forma
// independiente y el loader dejaría de encontrarlas — el bot no cargaría
// ningún plugin. Por eso queda explícitamente en false en los dos perfiles.

// ---------------------------------------------------------------------

const stats = { js: 0, plain: 0, errors: 0 };

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function isHot(relPath) {
  if (HOT_FILES.has(relPath)) return true;
  const topDir = relPath.split(path.sep)[0];
  return HOT_DIRS.has(topDir);
}

function obfuscateFile(srcPath, destPath, relPath) {
  const code = fs.readFileSync(srcPath, 'utf8');
  const profile = isHot(relPath) ? HOT_PROFILE : HEAVY_PROFILE;
  const tag = isHot(relPath) ? 'hot' : 'heavy';

  try {
    const result = JavaScriptObfuscator.obfuscate(code, profile).getObfuscatedCode();
    ensureDir(path.dirname(destPath));
    fs.writeFileSync(destPath, result);
    stats.js++;
    console.log(`  [${tag}] ${relPath}`);
  } catch (e) {
    stats.errors++;
    console.error(`  ERROR obfuscando ${relPath}: ${e.message} — se copia sin obfuscar para no romper el build`);
    ensureDir(path.dirname(destPath));
    fs.copyFileSync(srcPath, destPath);
  }
}

function copyPlain(srcPath, destPath) {
  ensureDir(path.dirname(destPath));
  fs.copyFileSync(srcPath, destPath);
  stats.plain++;
}

function walkAndObfuscate(srcRoot, destRoot, relBase) {
  const entries = fs.readdirSync(srcRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDE.has(entry.name)) continue;
    const srcPath = path.join(srcRoot, entry.name);
    const destPath = path.join(destRoot, entry.name);
    const relPath = path.join(relBase, entry.name);

    if (entry.isDirectory()) {
      walkAndObfuscate(srcPath, destPath, relPath);
    } else if (entry.name.endsWith('.js')) {
      obfuscateFile(srcPath, destPath, relPath);
    } else {
      copyPlain(srcPath, destPath);
    }
  }
}

function buildPackageJson() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

  delete pkg.devDependencies; // nodemon, javascript-obfuscator no hacen falta en runtime
  delete pkg.dependencies?.['javascript-obfuscator'];

  // Scripts de desarrollo no tienen sentido en el build público
  const { dev, ...runtimeScripts } = pkg.scripts || {};
  pkg.scripts = runtimeScripts;

  fs.writeFileSync(path.join(DIST, 'package.json'), JSON.stringify(pkg, null, 2));
}

function main() {
  console.log('Build obfuscado — iniciando...\n');

  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
  ensureDir(DIST);

  for (const target of JS_TARGETS) {
    const srcPath = path.join(ROOT, target);
    if (!fs.existsSync(srcPath)) {
      console.warn(`  aviso: ${target} no existe, se salta`);
      continue;
    }
    const destPath = path.join(DIST, target);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      walkAndObfuscate(srcPath, destPath, target);
    } else if (target.endsWith('.js')) {
      obfuscateFile(srcPath, destPath, target);
    }
  }

  for (const target of COPY_AS_IS) {
    const srcPath = path.join(ROOT, target);
    if (!fs.existsSync(srcPath)) continue;
    const destPath = path.join(DIST, target);
    if (target === 'package.json') continue; // se genera aparte, ver buildPackageJson()
    fs.cpSync(srcPath, destPath, { recursive: true });
  }

  buildPackageJson();

  console.log(`\nListo. ${stats.js} archivos obfuscados, ${stats.plain} copiados sin tocar, ${stats.errors} errores.`);
  console.log(`Salida: ${DIST}`);
  console.log('\nAntes de pushear al repo público:');
  console.log('  1. cd dist && npm install --omit=dev');
  console.log('  2. node index.js   (smoke test: que cargue todos los plugins y responda un comando de cada carpeta)');
  console.log('  3. Revisá que dist/Sebastool/config/apis.js no tenga nada que prefieras manejar por variable de entorno en vez de código.');
}

main();
