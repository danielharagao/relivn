const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../phase1-core.js');

test('diagnóstico identifica a maior dimensão', () => {
  const result = core.calculateDiagnostic({
    q1: { dimension: 'attention', value: 4 },
    q2: { dimension: 'attention', value: 4 },
    q3: { dimension: 'uncertainty', value: 1 },
    q4: { dimension: 'uncertainty', value: 1 }
  });
  assert.equal(result.primary, 'attention');
  assert.equal(result.scores.attention, 100);
  assert.equal(result.scores.uncertainty, 25);
  assert.match(result.summary, /fragmentação/i);
});

test('diagnóstico limita respostas fora da escala', () => {
  const result = core.calculateDiagnostic({
    high: { dimension: 'agency', value: 99 },
    low: { dimension: 'agency', value: -10 }
  });
  assert.equal(result.scores.agency, 50);
});

test('progresso ignora reflexões duplicadas', () => {
  const result = core.progressFor([{ day: 1 }, { day: 1 }, { day: 2 }], 21);
  assert.deepEqual(result, { completed: 2, total: 21, percentage: 10, nextDay: 3 });
});

test('reflexão local usa apenas texto sanitizado', () => {
  const result = core.buildLocalReflection({
    concern: '  medo   de ficar para trás ',
    state: 'Agitado',
    insight: 'posso escolher',
    action: 'fechar uma tarefa'
  });
  assert.match(result, /medo de ficar para trás/);
  assert.match(result, /fechar uma tarefa/);
  assert.doesNotMatch(result, /  /);
});

test('exportação exclui campos internos desconhecidos', () => {
  const output = JSON.parse(core.exportUserData({
    profile: { name: 'Daniel' },
    reflections: [{ day: 1 }],
    secret: 'não exportar'
  }));
  assert.equal(output.product, 'Relivn');
  assert.equal(output.secret, undefined);
  assert.equal(output.reflections.length, 1);
});
