const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const fetch = require('node-fetch');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'frontend', 'index.html');
const scriptPath = path.join(root, 'frontend', 'script.js');

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

if (!fs.existsSync(indexPath)) fail(`index.html not found at ${indexPath}`);
if (!fs.existsSync(scriptPath)) fail(`script.js not found at ${scriptPath}`);

const html = fs.readFileSync(indexPath, 'utf8');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Provide fetch to the jsdom window so any fetch calls use node-fetch
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: 'http://127.0.0.1:8080' });
dom.window.fetch = fetch;

// Mirror console messages
['log','warn','error','info'].forEach((level) => {
  const orig = dom.window.console[level];
  dom.window.console[level] = (...args) => {
    console[level]('[window]', ...args);
    orig.apply(dom.window.console, args);
  };
});

let hadError = false;
dom.window.addEventListener('error', (ev) => {
  hadError = true;
  console.error('Uncaught error in window:', ev.error || ev.message || ev);
});

dom.window.addEventListener('unhandledrejection', (ev) => {
  hadError = true;
  console.error('Unhandled promise rejection in window:', ev.reason);
});

// Inject the script and run
const scriptEl = dom.window.document.createElement('script');
scriptEl.textContent = scriptContent;
dom.window.document.body.appendChild(scriptEl);

// Wait a short time for async code to run
setTimeout(() => {
  if (hadError) {
    console.error('Frontend runtime check failed. See errors above.');
    process.exit(1);
  } else {
    console.log('Frontend runtime check passed (no uncaught errors detected).');
    process.exit(0);
  }
}, 1500);
