const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files']
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  try {
    const target = process.env.RELIVN_BASE_URL || pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
    await page.goto(target, { waitUntil: 'load' });
    console.log('E2E: landing carregada');
    await page.waitForSelector('[data-start-diagnostic]');
    const headline = await page.$eval('.marketing-hero h1', element => element.textContent);
    if (!headline.includes('mundo acelerou')) throw new Error('Landing page não carregou');

    await page.click('[data-start-diagnostic]');
    console.log('E2E: diagnóstico aberto');
    await page.waitForSelector('#diagnosticForm');
    for (let index = 1; index <= 10; index += 1) {
      await page.click(`input[name="q${index}"][value="${index <= 2 ? 4 : 2}"]`);
    }
    await page.type('input[name="name"]', 'Pessoa Teste');
    await page.type('input[name="email"]', 'teste@example.com');
    await page.click('#diagnosticForm button[type="submit"]');
    console.log('E2E: diagnóstico enviado');
    await page.waitForSelector('.result-card');
    const result = await page.$eval('.result-card h1', element => element.textContent);
    if (!result.includes('Atenção')) throw new Error(`Resultado inesperado: ${result}`);

    await page.click('[data-activate-access]');
    console.log('E2E: vitrine de módulos aberta');
    await page.waitForSelector('.commerce-grid');
    const price = await page.$eval('.commerce-card .commerce-price strong', element => element.textContent);
    if (!price.includes('29,90')) throw new Error(`Preço inesperado: ${price}`);
    const preparing = await page.$eval('.commerce-card.preparing', element => element.textContent);
    if (!preparing.includes('EM PREPARAÇÃO')) throw new Error('Autorregulação não está sinalizado como em preparação');
    await page.click('[data-buy-module="attention"]');
    console.log('E2E: compra do módulo Atenção simulada');
    await page.waitForSelector('[data-continue-module="attention"]');
    await page.click('[data-continue-module="attention"]');
    await page.waitForSelector('.daily-flow');
    const dayOne = await page.$eval('.today-header .eyebrow', element => element.textContent);
    if (!dayOne.includes('DIA 1')) throw new Error('Dia 1 não foi aberto');

    await page.click('[data-reflect="1"]');
    console.log('E2E: reflexão aberta');
    await page.waitForSelector('#reflectionForm');
    await page.type('textarea[name="concern"]', 'Estou consumindo novidades demais.');
    await page.type('textarea[name="insight"]', 'Posso escolher uma única prioridade.');
    await page.$eval('textarea[name="action"]', element => { element.value = ''; });
    await page.type('textarea[name="action"]', 'Fechar uma tarefa antes de abrir outra ferramenta.');
    await page.click('#reflectionForm button[type="submit"]');
    console.log('E2E: reflexão enviada');
    await page.waitForFunction(() => document.querySelector('.today-header .eyebrow')?.textContent.includes('DIA 2'));

    await page.click('a[href="#diario"]');
    console.log('E2E: diário aberto');
    await page.waitForSelector('.journal-list article');
    const journal = await page.$eval('.journal-list', element => element.textContent);
    if (!journal.includes('Estou consumindo novidades demais')) throw new Error('Diário não preservou a reflexão');

    if (errors.length) throw new Error(`Erros no navegador:\n${errors.join('\n')}`);
    console.log('✓ E2E: landing → diagnóstico → resultado → acesso → reflexão → diário');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
