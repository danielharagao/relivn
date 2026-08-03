(() => {
  'use strict';

  const core = window.RELIVN_CORE;
  const phase = window.RELIVN_PHASE1;
  const config = window.RELIVN_CONFIG || {};
  if (!core || !phase) return;

  const STORAGE_KEY = 'relivn-phase1-state';
  const $ = (selector, root = document) => root.querySelector(selector);
  const appShell = $('.app-shell');
  const player = $('#player');
  const app = $('#app');
  const initialState = {
    profile: null,
    diagnostic: null,
    reflections: [],
    preferences: { reminder: '' },
    access: false,
    events: []
  };
  let state = loadState();
  let onboardingStep = 'landing';

  const phaseRoot = document.createElement('div');
  phaseRoot.id = 'phase1Root';
  document.body.prepend(phaseRoot);

  function loadState() {
    try {
      return { ...initialState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch {
      return { ...initialState };
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function track(name, properties = {}) {
    state.events = [...(state.events || []).slice(-99), { name, properties, at: new Date().toISOString() }];
    persist();
  }

  function escapeHTML(value) {
    const node = document.createElement('div');
    node.textContent = value == null ? '' : String(value);
    return node.innerHTML;
  }

  function showMarketing() {
    appShell.hidden = true;
    player.hidden = true;
    phaseRoot.hidden = false;
    document.body.classList.add('phase1-marketing-open');
    renderOnboarding();
  }

  function showProduct() {
    phaseRoot.hidden = true;
    appShell.hidden = false;
    document.body.classList.remove('phase1-marketing-open');
    installProductNav();
    updateIdentity();
    renderEnhancedRoute();
  }

  function renderOnboarding() {
    if (onboardingStep === 'diagnostic') return renderDiagnostic();
    if (onboardingStep === 'result') return renderResult();
    phaseRoot.innerHTML = `
      <main class="marketing-page">
        <nav class="marketing-nav">
          <a class="marketing-brand" href="#"><span class="brand-mark"><span></span></span><strong>relivn</strong></a>
          <button class="button secondary" data-existing-access>Já comecei</button>
        </nav>
        <section class="marketing-hero">
          <div>
            <span class="eyebrow">IA · CONSCIÊNCIA · AGÊNCIA HUMANA</span>
            <h1>O mundo acelerou.<br>Sua mente não precisa acelerar junto.</h1>
            <p>${escapeHTML(phase.promise)}</p>
            <div class="marketing-actions">
              <button class="button primary large" data-start-diagnostic>Fazer diagnóstico gratuito →</button>
              <small>5 minutos · seus dados ficam neste dispositivo durante a versão alpha</small>
            </div>
          </div>
          <aside class="clarity-card">
            <span class="eyebrow">JORNADA DE 21 DIAS</span>
            <h2>Perceber. Distinguir.<br>Escolher. Agir. Revisar.</h2>
            <ul>
              <li>Práticas guiadas de 12–15 minutos</li>
              <li>Reflexões ligadas à sua realidade</li>
              <li>Uma pequena ação por dia</li>
              <li>Progresso sem culpa ou sequência punitiva</li>
            </ul>
          </aside>
        </section>
        <section class="marketing-proof">
          <div><strong>10+ anos</strong><span>de prática contemplativa</span></div>
          <div><strong>21 práticas</strong><span>em uma progressão clara</span></div>
          <div><strong>1 direção</strong><span>sem precisar prever o futuro</span></div>
        </section>
        <section class="marketing-section">
          <span class="eyebrow">PARA QUEM É</span>
          <h2>Possibilidades demais.<br>Critérios de menos.</h2>
          <div class="pain-grid">
            <article><strong>FOMO tecnológico</strong><p>Você sente que precisa acompanhar toda ferramenta e modelo novo.</p></article>
            <article><strong>Incerteza profissional</strong><p>O mercado muda rápido e você não sabe onde concentrar energia.</p></article>
            <article><strong>Atenção fragmentada</strong><p>Você consome muito, inicia várias coisas e sustenta poucas.</p></article>
          </div>
        </section>
        <section class="founder-strip">
          <div><span class="eyebrow">POR DANIEL ARAGÃO</span><h2>Tecnologia para ampliar consciência, não para substituir autonomia.</h2></div>
          <p>Profissional de produtos de IA, formado em produtos de IA pelo MIT e praticante de meditação há mais de dez anos.</p>
        </section>
        <footer class="marketing-footer">
          <p>Relivn apoia reflexão e desenvolvimento pessoal. Não substitui psicólogo, psiquiatra, médico ou atendimento de emergência.</p>
          <button class="text-link" data-start-diagnostic>Começar diagnóstico →</button>
        </footer>
      </main>`;
  }

  function renderDiagnostic() {
    track('diagnostic_viewed');
    phaseRoot.innerHTML = `
      <main class="onboarding-page">
        <button class="text-link back-link" data-back-landing>← Voltar</button>
        <form class="diagnostic-card" id="diagnosticForm">
          <span class="eyebrow">DIAGNÓSTICO DE CLAREZA</span>
          <h1>Como a aceleração aparece na sua rotina?</h1>
          <p>Responda pensando nas últimas duas semanas. Isto não é uma avaliação clínica.</p>
          <div class="question-list">
            ${phase.questions.map((question, index) => `
              <fieldset class="question-card">
                <legend><span>${String(index + 1).padStart(2, '0')}</span>${escapeHTML(question.text)}</legend>
                <div class="scale-options">
                  ${phase.scale.map((label, value) => `<label><input required type="radio" name="${question.id}" value="${value}"><span>${escapeHTML(label)}</span></label>`).join('')}
                </div>
              </fieldset>`).join('')}
          </div>
          <section class="profile-fields">
            <h2>Para personalizar seu resultado</h2>
            <label>Como podemos chamar você?<input required name="name" maxlength="60" autocomplete="given-name" placeholder="Seu primeiro nome"></label>
            <label>E-mail<input required name="email" type="email" maxlength="160" autocomplete="email" placeholder="voce@exemplo.com"></label>
            <p>Na versão alpha, essas informações ficam somente neste dispositivo e podem ser exportadas ou apagadas.</p>
          </section>
          <button class="button primary large" type="submit">Ver meu mapa de clareza →</button>
        </form>
      </main>`;
  }

  function renderResult() {
    const diagnostic = state.diagnostic;
    if (!diagnostic) { onboardingStep = 'diagnostic'; return renderDiagnostic(); }
    const scoreRows = Object.entries(diagnostic.scores).map(([key, value]) => `
      <div class="score-row"><span>${escapeHTML(core.PROFILE_LABELS[key])}</span><div><i style="width:${value}%"></i></div><strong>${value}</strong></div>`).join('');
    phaseRoot.innerHTML = `
      <main class="onboarding-page result-page">
        <section class="result-card">
          <span class="eyebrow">SEU PONTO DE PARTIDA</span>
          <h1>${escapeHTML(diagnostic.label)}</h1>
          <p class="result-summary">${escapeHTML(diagnostic.summary)}</p>
          <div class="score-list">${scoreRows}</div>
          <div class="result-next">
            <span>Próximo passo recomendado</span>
            <strong>Começar por atenção e retorno, antes de tentar encontrar uma resposta definitiva.</strong>
          </div>
          <button class="button primary large" data-activate-access>${config.checkoutUrl ? 'Entrar na jornada fundadora' : 'Explorar a jornada alpha'} →</button>
          <small>Ferramenta de desenvolvimento pessoal; não constitui diagnóstico clínico.</small>
        </section>
      </main>`;
  }

  function submitDiagnostic(form) {
    const formData = new FormData(form);
    const answers = {};
    phase.questions.forEach(question => {
      answers[question.id] = { dimension: question.dimension, value: Number(formData.get(question.id)) };
    });
    state.profile = {
      name: core.sanitizeText(formData.get('name'), 60),
      email: core.sanitizeText(formData.get('email'), 160),
      createdAt: new Date().toISOString()
    };
    state.diagnostic = { ...core.calculateDiagnostic(answers), answers, completedAt: new Date().toISOString() };
    persist();
    track('diagnostic_completed', { primary: state.diagnostic.primary, overall: state.diagnostic.overall });
    onboardingStep = 'result';
    renderResult();
  }

  function activateAccess() {
    if (config.checkoutUrl) {
      track('checkout_started');
      location.href = config.checkoutUrl;
      return;
    }
    state.access = true;
    persist();
    track('alpha_access_activated');
    location.hash = 'inicio';
    showProduct();
  }

  function installProductNav() {
    const nav = $('.main-nav');
    if (!nav || $('[data-route="programa"]', nav)) return;
    nav.innerHTML = `
      <a href="#inicio" data-route="inicio"><span>⌂</span> Hoje</a>
      <a href="#programa" data-route="programa"><span>◫</span> Jornada 21 dias</a>
      <a href="#diario" data-route="diario"><span>✎</span> Diário</a>
      <a href="#leituras" data-route="leituras"><span>≡</span> Leituras</a>
      <a href="#favoritos" data-route="favoritos"><span>♡</span> Favoritos</a>
      <a href="#conta" data-route="conta"><span>○</span> Minha conta</a>`;
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => $('#sidebar').classList.remove('open')));
  }

  function updateIdentity() {
    const name = state.profile?.name || 'Você';
    const avatar = $('.avatar');
    if (avatar) {
      avatar.textContent = name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
      avatar.title = name;
    }
    const subtitle = $('.brand small');
    if (subtitle) subtitle.textContent = 'clareza em tempos de incerteza';
  }

  function currentProgress() {
    return core.progressFor(state.reflections, phase.days.length);
  }

  function renderToday() {
    const progress = currentProgress();
    const day = phase.days[progress.nextDay - 1] || phase.days[phase.days.length - 1];
    const previous = state.reflections.find(item => item.day === day.day);
    app.innerHTML = `
      <section class="today-header">
        <div><span class="eyebrow">DIA ${day.day} DE 21 · ${escapeHTML(day.cycle)}</span><h1>${escapeHTML(day.title)}</h1><p>${escapeHTML(day.prompt)}</p></div>
        <div class="today-progress"><strong>${progress.percentage}%</strong><span>da jornada</span></div>
      </section>
      <section class="daily-flow">
        <article><span>01</span><div><small>CHEGUE</small><h2>Perceba como você está</h2><p>Não é preciso mudar seu estado antes de começar.</p></div></article>
        <article><span>02</span><div><small>PRATIQUE</small><h2>${escapeHTML(day.title)}</h2><p>Prática guiada correspondente ao dia.</p><button class="button primary" data-play="${day.practiceId}">Ouvir prática ▶</button></div></article>
        <article><span>03</span><div><small>REFLITA</small><h2>${escapeHTML(day.prompt)}</h2><p>A reflexão leva o que você percebeu para uma situação concreta.</p><button class="button secondary" data-reflect="${day.day}">${previous ? 'Rever reflexão' : 'Registrar reflexão'} →</button></div></article>
        <article><span>04</span><div><small>AJA</small><h2>Experimento do dia</h2><p>${escapeHTML(day.action)}</p></div></article>
      </section>
      ${previous ? `<section class="daily-summary"><span class="eyebrow">SEU REGISTRO</span><p>${escapeHTML(previous.summary)}</p><strong>${escapeHTML(previous.action)}</strong></section>` : ''}`;
    updateTopbar('Hoje');
  }

  function renderProgram() {
    const progress = currentProgress();
    app.innerHTML = `<div class="page-title"><div><span class="eyebrow">PERCEBER · DISTINGUIR · ESCOLHER · AGIR · REVISAR</span><h1>Jornada de 21 dias</h1><p>Continue sem culpa. Retomar também faz parte da prática.</p></div><strong>${progress.completed}/21</strong></div>
      <div class="phase-day-list">${phase.days.map(day => {
        const reflection = state.reflections.find(item => item.day === day.day);
        const available = day.day <= progress.nextDay;
        return `<article class="phase-day ${reflection ? 'completed' : ''} ${available ? '' : 'locked'}">
          <span class="phase-day-number">${reflection ? '✓' : String(day.day).padStart(2, '0')}</span>
          <div><small>${escapeHTML(day.cycle)}</small><h3>${escapeHTML(day.title)}</h3><p>${escapeHTML(day.prompt)}</p></div>
          <button class="round-button" ${available ? `data-open-day="${day.day}"` : 'disabled'} aria-label="Abrir dia ${day.day}">${available ? '→' : '·'}</button>
        </article>`;
      }).join('')}</div>`;
    updateTopbar('Jornada 21 dias');
  }

  function renderJournal() {
    const reflections = [...state.reflections].sort((a, b) => b.day - a.day);
    app.innerHTML = `<div class="page-title"><div><span class="eyebrow">O QUE VOCÊ ESTÁ PERCEBENDO</span><h1>Seu diário</h1><p>Registros privados guardados neste dispositivo durante a versão alpha.</p></div></div>
      ${reflections.length ? `<div class="journal-list">${reflections.map(item => `<article><span>Dia ${item.day}</span><h2>${escapeHTML(phase.days[item.day - 1]?.title)}</h2><p>${escapeHTML(item.summary)}</p><strong>Próxima ação: ${escapeHTML(item.action)}</strong><time>${new Date(item.createdAt).toLocaleDateString('pt-BR')}</time></article>`).join('')}</div>` : '<div class="empty-state"><strong>Seu diário começa na primeira prática</strong><span>Depois da prática, registre o que percebeu e uma pequena ação.</span></div>'}`;
    updateTopbar('Diário');
  }

  function renderAccount() {
    app.innerHTML = `<div class="page-title"><div><span class="eyebrow">PRIVACIDADE E CONTROLE</span><h1>Minha conta</h1><p>Esta versão alpha ainda usa armazenamento local, sem sincronização entre dispositivos.</p></div></div>
      <div class="account-grid">
        <section><h2>Perfil</h2><p><strong>${escapeHTML(state.profile?.name)}</strong><br>${escapeHTML(state.profile?.email)}</p><span class="status-pill">ALPHA LOCAL</span></section>
        <section><h2>Seus dados</h2><p>Exporte uma cópia legível ou apague permanentemente os registros deste dispositivo.</p><div><button class="button secondary" data-export-data>Exportar dados</button> <button class="button danger" data-delete-data>Apagar dados</button></div></section>
        <section><h2>Limites</h2><p>A Relivn apoia reflexão e desenvolvimento pessoal. Não substitui psicólogo, psiquiatra, médico ou atendimento de emergência.</p></section>
      </div>`;
    updateTopbar('Minha conta');
  }

  function updateTopbar(title) {
    const titleElement = $('#topbarTitle');
    if (titleElement) titleElement.textContent = title;
    document.querySelectorAll('.main-nav a').forEach(link => link.classList.toggle('active', link.hash === location.hash));
  }

  function renderEnhancedRoute() {
    if (!state.access) return showMarketing();
    const route = location.hash.slice(1).split('/')[0] || 'inicio';
    setTimeout(() => {
      if (route === 'inicio') renderToday();
      else if (route === 'programa') renderProgram();
      else if (route === 'diario') renderJournal();
      else if (route === 'conta') renderAccount();
      else updateIdentity();
    }, 0);
  }

  function openReflection(dayNumber) {
    const day = phase.days[dayNumber - 1];
    if (!day) return;
    const existing = state.reflections.find(item => item.day === dayNumber) || {};
    phaseRoot.hidden = false;
    phaseRoot.innerHTML = `<div class="reflection-overlay"><form class="reflection-panel" id="reflectionForm" data-day="${dayNumber}">
      <button type="button" class="icon-button reflection-close" data-close-reflection>×</button>
      <span class="eyebrow">DIA ${dayNumber} · REFLEXÃO GUIADA</span>
      <h1>${escapeHTML(day.prompt)}</h1>
      <label>Como sua mente está agora?
        <select name="state"><option>Tranquilo</option><option>Atento</option><option>Agitado</option><option>Cansado</option><option>Confuso</option><option>Esperançoso</option></select>
      </label>
      <label>Que situação está mais presente?<textarea name="concern" required maxlength="400" placeholder="Descreva uma situação concreta...">${escapeHTML(existing.concern)}</textarea></label>
      <label>O que você percebeu durante a prática?<textarea name="insight" required maxlength="600" placeholder="Não precisa ser uma conclusão definitiva...">${escapeHTML(existing.insight)}</textarea></label>
      <label>Qual pequena ação você escolhe?<textarea name="action" required maxlength="240">${escapeHTML(existing.action || day.action)}</textarea></label>
      <button class="button primary large" type="submit">Salvar reflexão e concluir o dia</button>
      <small>${config.reflectionEndpoint ? 'A resposta será processada pelo assistente de reflexão.' : 'Alpha local: síntese estruturada sem envio para um serviço externo de IA.'}</small>
    </form></div>`;
  }

  async function submitReflection(form) {
    const day = Number(form.dataset.day);
    const values = Object.fromEntries(new FormData(form));
    let summary;
    if (config.reflectionEndpoint) {
      try {
        const response = await fetch(config.reflectionEndpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ day, ...values, prompt: phase.days[day - 1].prompt })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        summary = core.sanitizeText(result.summary, 1200);
      } catch {
        summary = core.buildLocalReflection(values);
      }
    } else summary = core.buildLocalReflection(values);
    const record = {
      day,
      state: core.sanitizeText(values.state, 80),
      concern: core.sanitizeText(values.concern, 400),
      insight: core.sanitizeText(values.insight, 600),
      action: core.sanitizeText(values.action, 240),
      summary,
      createdAt: new Date().toISOString()
    };
    state.reflections = [...state.reflections.filter(item => item.day !== day), record];
    persist();
    track('day_reflection_completed', { day });
    phaseRoot.hidden = true;
    location.hash = 'inicio';
    renderToday();
  }

  function exportData() {
    const blob = new Blob([core.exportUserData(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relivn-dados-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    track('data_exported');
  }

  function deleteData() {
    if (!confirm('Apagar perfil, diagnóstico, diário e progresso deste dispositivo? Esta ação não pode ser desfeita.')) return;
    Object.keys(localStorage).filter(key => key.startsWith('relivn-')).forEach(key => localStorage.removeItem(key));
    location.hash = '';
    location.reload();
  }

  document.addEventListener('submit', event => {
    if (event.target.id === 'diagnosticForm') { event.preventDefault(); submitDiagnostic(event.target); }
    if (event.target.id === 'reflectionForm') { event.preventDefault(); submitReflection(event.target); }
  });

  document.addEventListener('click', event => {
    if (event.target.closest('[data-start-diagnostic]')) { onboardingStep = 'diagnostic'; renderOnboarding(); }
    if (event.target.closest('[data-back-landing]')) { onboardingStep = 'landing'; renderOnboarding(); }
    if (event.target.closest('[data-activate-access]')) activateAccess();
    if (event.target.closest('[data-existing-access]')) {
      if (state.access) showProduct();
      else { onboardingStep = state.diagnostic ? 'result' : 'diagnostic'; renderOnboarding(); }
    }
    const reflect = event.target.closest('[data-reflect]');
    if (reflect) openReflection(Number(reflect.dataset.reflect));
    const openDay = event.target.closest('[data-open-day]');
    if (openDay) { const day = Number(openDay.dataset.openDay); location.hash = 'inicio'; openReflection(day); }
    if (event.target.closest('[data-close-reflection]')) { phaseRoot.hidden = true; }
    if (event.target.closest('[data-export-data]')) exportData();
    if (event.target.closest('[data-delete-data]')) deleteData();
  });

  window.addEventListener('hashchange', renderEnhancedRoute);

  if (state.access) showProduct();
  else showMarketing();
})();
