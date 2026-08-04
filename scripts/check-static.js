const fs = require('node:fs');
const path = require('node:path');
const required = [
  'index.html', 'styles.css', 'app.js', 'app-data.js', 'transcriptions.js',
  'phase1-core.js', 'phase1-data.js', 'phase1.js', 'relivn-config.js',
  'manifest.webmanifest', 'service-worker.js'
];
for (const file of required) {
  if (!fs.existsSync(path.join(__dirname, '..', file))) {
    console.error(`Arquivo obrigatório ausente: ${file}`);
    process.exitCode = 1;
  }
}
if (!process.exitCode) console.log(`✓ ${required.length} arquivos estáticos verificados`);
