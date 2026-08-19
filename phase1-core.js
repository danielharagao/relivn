(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RELIVN_CORE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DIMENSIONS = ['attention', 'uncertainty', 'agency', 'reactivity', 'direction'];
  const PROFILE_LABELS = {
    attention: 'Atenção capturada',
    uncertainty: 'Incerteza elevada',
    agency: 'Agência reduzida',
    reactivity: 'Reatividade',
    direction: 'Direção difusa'
  };
  const PROFILE_COPY = {
    attention: 'Seu principal ponto de atenção é a fragmentação. O primeiro passo não é acompanhar mais, mas perceber quando sua atenção deixa de ser uma escolha.',
    uncertainty: 'A incerteza está ocupando muito espaço. A jornada vai ajudá-lo a separar fatos, possibilidades e projeções sem exigir uma resposta definitiva.',
    agency: 'Você percebe o cenário, mas está com dificuldade para transformá-lo em ação. O foco será recuperar movimentos pequenos, concretos e reversíveis.',
    reactivity: 'A pressão tem encurtado o espaço entre estímulo e resposta. A prática começa criando uma pausa antes de decidir ou agir.',
    direction: 'Existem possibilidades demais e critérios de menos. A jornada vai ajudá-lo a distinguir pressão externa, desejo e prioridade atual.'
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function calculateDiagnostic(answers) {
    const totals = Object.fromEntries(DIMENSIONS.map(key => [key, 0]));
    const counts = Object.fromEntries(DIMENSIONS.map(key => [key, 0]));
    Object.entries(answers || {}).forEach(([key, answer]) => {
      if (!answer || !DIMENSIONS.includes(answer.dimension)) return;
      const score = clamp(answer.value, 0, 4);
      totals[answer.dimension] += score;
      counts[answer.dimension] += 1;
    });
    const scores = {};
    DIMENSIONS.forEach(key => {
      scores[key] = counts[key] ? Math.round((totals[key] / (counts[key] * 4)) * 100) : 0;
    });
    const primary = DIMENSIONS.reduce((best, key) => scores[key] > scores[best] ? key : best, DIMENSIONS[0]);
    const overall = Math.round(DIMENSIONS.reduce((sum, key) => sum + scores[key], 0) / DIMENSIONS.length);
    return {
      scores,
      primary,
      overall,
      label: PROFILE_LABELS[primary],
      summary: PROFILE_COPY[primary]
    };
  }

  function progressFor(reflections, totalDays) {
    const completed = new Set((reflections || []).filter(item => item && item.day).map(item => Number(item.day)));
    return {
      completed: completed.size,
      total: totalDays,
      percentage: totalDays ? Math.round((completed.size / totalDays) * 100) : 0,
      nextDay: Math.min(totalDays, completed.size + 1)
    };
  }

  function sanitizeText(value, maxLength) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength || 1200);
  }

  function buildLocalReflection(input) {
    const concern = sanitizeText(input.concern, 400);
    const insight = sanitizeText(input.insight, 600);
    const action = sanitizeText(input.action, 240);
    const state = sanitizeText(input.state, 80);
    const phrases = [];
    if (concern) phrases.push(`Hoje você trouxe “${concern}” como tema principal.`);
    if (state) phrases.push(`Seu estado foi descrito como ${state.toLowerCase()}.`);
    if (insight) phrases.push(`O ponto que você quer levar da prática é: “${insight}”.`);
    if (action) phrases.push(`Seu próximo experimento é “${action}”.`);
    phrases.push('Observe o que acontece sem transformar este registro em cobrança. Amanhã, revise apenas o que aprendeu.');
    return phrases.join(' ');
  }

  function exportUserData(state) {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      product: 'Relivn',
      schemaVersion: 1,
      profile: state.profile || null,
      diagnostic: state.diagnostic || null,
      entitlements: state.entitlements || [],
      reflections: state.reflections || [],
      preferences: state.preferences || {}
    }, null, 2);
  }

  return {
    DIMENSIONS,
    PROFILE_LABELS,
    calculateDiagnostic,
    progressFor,
    sanitizeText,
    buildLocalReflection,
    exportUserData
  };
});
