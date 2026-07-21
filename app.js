(() => {
  'use strict';
  const data = window.RELIVN_DATA;
  const transcripts = window.RELIVN_TRANSCRIPTS || {};
  if (!data) throw new Error('Dados do aplicativo não carregados. Execute build_content.py.');

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = {
    completed: new Set(JSON.parse(localStorage.getItem('relivn-completed') || '[]')),
    favorites: new Set(JSON.parse(localStorage.getItem('relivn-favorites') || '[]')),
    currentAudio: null,
    currentReading: null,
    currentTranscript: null,
    speedIndex: 0,
    wakeLock: null,
    installPrompt: null,
    lastPositionSave: 0
  };
  const app = $('#app');
  const audio = $('#audio');
  const modulePractices = data.modules.flatMap(m => m.practices).filter(p => p.audio);
  const bonusPractice = data.bonus?.audio ? { ...data.bonus, module: 'bonus', label: 'Prática bônus' } : null;
  const availablePractices = bonusPractice ? [...modulePractices, bonusPractice] : modulePractices;
  const allTrackable = [...availablePractices.map(p => `practice:${p.id}`), ...data.readings.map(r => `reading:${r.id}`)];

  function save() {
    localStorage.setItem('relivn-completed', JSON.stringify([...state.completed]));
    localStorage.setItem('relivn-favorites', JSON.stringify([...state.favorites]));
    updateProgress();
  }
  function progress() { return allTrackable.length ? Math.round(state.completed.size / allTrackable.length * 100) : 0; }
  function updateProgress() {
    const pct = progress();
    $('#sideProgressText').textContent = `${pct}%`;
    $('#sideProgressBar').style.width = `${pct}%`;
    $('#sideProgressDetail').textContent = `${state.completed.size} de ${allTrackable.length} atividades concluídas.`;
  }
  function escapeHTML(value) { const d = document.createElement('div'); d.textContent = value; return d.innerHTML; }
  function moduleById(id) { return data.modules.find(m => m.id === id); }
  function readingById(id) { return data.readings.find(r => r.id === id); }
  function practiceById(id) { return availablePractices.find(p => p.id === id); }
  function transcriptFor(practice) { return practice?.audio ? transcripts[practice.audio] : null; }
  function readingMinutes(r) { return Math.max(2, Math.ceil(r.wordCount / 210)); }
  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60), s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  function savedPositions() { return JSON.parse(localStorage.getItem('relivn-audio-positions') || '{}'); }
  function saveAudioPosition(force = false) {
    if (!state.currentAudio || !Number.isFinite(audio.currentTime)) return;
    if (!force && audio.currentTime - state.lastPositionSave < 5) return;
    const positions = savedPositions();
    positions[state.currentAudio.id] = Math.round(audio.currentTime);
    localStorage.setItem('relivn-audio-positions', JSON.stringify(positions));
    state.lastPositionSave = audio.currentTime;
  }
  function route() { return (location.hash.slice(1).split('/')[0] || 'inicio'); }
  function setRouteActive(name) {
    $$('.main-nav a').forEach(a => a.classList.toggle('active', a.dataset.route === name));
    const names = { inicio: 'Hoje', jornada: 'Minha jornada', leituras: 'Leituras', favoritos: 'Favoritos' };
    $('#topbarTitle').textContent = names[name] || 'Relivn';
  }
  function nextPractice() {
    return availablePractices.find(p => !state.completed.has(`practice:${p.id}`)) || availablePractices[0];
  }
  function moduleStats(module) {
    const available = module.practices.filter(p => p.audio);
    const ids = available.map(p => `practice:${p.id}`);
    const done = ids.filter(id => state.completed.has(id)).length;
    return { done, total: ids.length, pct: ids.length ? Math.round(done / ids.length * 100) : 0 };
  }

  function renderHome() {
    const next = nextPractice();
    const mod = moduleById(next.module);
    const completedPractices = availablePractices.filter(p => state.completed.has(`practice:${p.id}`)).length;
    app.innerHTML = `
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">PRESENÇA · CLAREZA · ESCOLHA</span>
          <h1>Um espaço para voltar a si.</h1>
          <p>Práticas guiadas e estudos para treinar sua atenção, compreender suas emoções e responder à vida com mais consciência.</p>
          <button class="button primary" data-play="${next.id}">Continuar a jornada&nbsp; →</button>
        </div>
        <div class="hero-art" aria-hidden="true"><div class="hero-leaf"><i></i><i></i><i></i></div></div>
      </section>
      <section class="section">
        <div class="section-head"><div><h2>Continue de onde parou</h2><p>Sua próxima prática na sequência original.</p></div><button class="text-link" data-go="jornada">Ver jornada completa →</button></div>
        <div class="continue-grid">
          <article class="continue-card">
            <div class="practice-orb"><button data-play="${next.id}" aria-label="Ouvir ${escapeHTML(next.title)}">▶</button></div>
            <div><div class="card-meta"><span>${escapeHTML(mod.title)}</span><span>•</span><span>${formatTime(next.duration)}</span></div><h3>${escapeHTML(next.title)}</h3><p>${escapeHTML(next.description || mod.description)}</p></div>
          </article>
          <aside class="streak-card"><span class="eyebrow" style="color:#fff2e9">PROGRESSO</span><strong>${completedPractices}</strong><p>práticas concluídas</p><div class="week-dots">${['S','T','Q','Q','S'].map((d,i) => `<span class="${i < Math.min(completedPractices % 5, 5) ? 'done' : ''}">${d}</span>`).join('')}</div></aside>
        </div>
      </section>
      <section class="section">
        <div class="section-head"><div><h2>As três etapas</h2><p>A ordem encontrada nos roteiros e nas datas das gravações.</p></div></div>
        <div class="module-grid">${data.modules.map(moduleCard).join('')}</div>
      </section>`;
  }

  function moduleCard(m, index) {
    const s = moduleStats(m);
    return `<article class="module-card" data-module="${m.id}">
      <span class="module-number">0${index + 1}</span><h3>${escapeHTML(m.title)}</h3><p>${escapeHTML(m.description)}</p>
      <div class="mini-progress"><div><span>${s.done} de ${s.total} práticas</span><strong>${s.pct}%</strong></div><div class="progress-track"><i style="width:${s.pct}%"></i></div></div>
    </article>`;
  }

  function renderJourney(focusModule) {
    app.innerHTML = `<div class="page-title"><div><span class="eyebrow">PROGRAMA RELIVN</span><h1>Sua jornada</h1><p>Pratique de segunda a sexta. Use o fim de semana para recuperar uma prática.</p></div></div>
      ${data.modules.map(m => renderModule(m)).join('')}${bonusPractice ? renderBonus() : ''}`;
    if (focusModule) setTimeout(() => document.getElementById(`module-${focusModule}`)?.scrollIntoView(), 0);
  }
  function renderModule(m) {
    const s = moduleStats(m);
    return `<section class="module-section" id="module-${m.id}">
      <div class="module-banner"><div><span class="eyebrow" style="color:#e3ba72">${escapeHTML(m.kicker)}</span><h2>${escapeHTML(m.title)}</h2><p>${escapeHTML(m.description)}</p></div><div><strong>${s.pct}%</strong><p>${s.done}/${s.total} disponíveis</p></div></div>
      <div class="lesson-list">${m.practices.map((p, i) => lessonRow(p, i)).join('')}</div>
    </section>`;
  }
  function renderBonus() {
    return `<section class="module-section" id="module-bonus">
      <div class="module-banner"><div><span class="eyebrow" style="color:#e3ba72">PRÁTICA BÔNUS</span><h2>Campo Cósmico</h2><p>Uma meditação complementar para encerrar a jornada.</p></div></div>
      <div class="lesson-list">${lessonRow(bonusPractice, 0)}</div>
    </section>`;
  }
  function lessonRow(p, index) {
    const done = state.completed.has(`practice:${p.id}`), fav = state.favorites.has(`practice:${p.id}`);
    return `<article class="lesson ${done ? 'completed' : ''}">
      <div class="lesson-index">${done ? '✓' : String(index + 1).padStart(2,'0')}</div>
      <div><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.label)}${p.audio ? ` · ${formatTime(p.duration)}` : ' · edição final não localizada'}</p></div>
      <div class="lesson-actions">
        ${p.audio ? `<button class="round-button favorite ${fav ? 'on' : ''}" data-favorite="practice:${p.id}" aria-label="Favoritar">♡</button>${transcriptFor(p) ? `<button class="round-button" data-transcript="${p.id}" aria-label="Ler transcrição">≡</button>` : ''}<button class="round-button" data-play="${p.id}" aria-label="Ouvir">▶</button>` : '<span class="status-pill">INDISPONÍVEL</span>'}
      </div>
    </article>`;
  }

  function renderReadings(filterModule = 'all') {
    const tabs = ['all', ...data.modules.map(m => m.id), 'complementar'];
    const list = filterModule === 'all' ? data.readings : data.readings.filter(r => r.module === filterModule);
    app.innerHTML = `<div class="page-title"><div><span class="eyebrow">ESTUDOS</span><h1>Biblioteca de leituras</h1><p>Textos originais recuperados dos documentos do programa.</p></div></div>
      <div class="section-head"><div class="filter-tabs">${tabs.map(t => `<button class="button ${t === filterModule ? 'primary' : 'secondary'}" data-reading-filter="${t}">${t === 'all' ? 'Todas' : (moduleById(t)?.title || 'Complementares')}</button>`).join(' ')}</div></div>
      <div class="reading-grid">${list.map(readingCard).join('')}</div>`;
  }
  function readingCard(r) {
    const done = state.completed.has(`reading:${r.id}`), fav = state.favorites.has(`reading:${r.id}`);
    const mod = moduleById(r.module);
    return `<article class="reading-card"><div class="reading-icon">${done ? '✓' : '¶'}</div><span class="eyebrow" style="margin-top:17px">${escapeHTML(mod?.title || 'Complementar')}</span><h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.excerpt)}</p><footer><span>${readingMinutes(r)} min de leitura</span><span><button class="round-button favorite ${fav ? 'on' : ''}" data-favorite="reading:${r.id}" aria-label="Favoritar">♡</button> <button class="text-link" data-read="${r.id}">Ler →</button></span></footer></article>`;
  }

  function renderFavorites() {
    const practices = availablePractices.filter(p => state.favorites.has(`practice:${p.id}`));
    const readings = data.readings.filter(r => state.favorites.has(`reading:${r.id}`));
    app.innerHTML = `<div class="page-title"><div><span class="eyebrow">SUA COLEÇÃO</span><h1>Favoritos</h1><p>Práticas e leituras guardadas para voltar quando quiser.</p></div></div>
      ${!practices.length && !readings.length ? '<div class="empty-state"><strong>Nenhum favorito ainda</strong><span>Use o coração nas práticas e leituras para guardar aqui.</span></div>' : ''}
      ${practices.length ? `<section class="module-section"><div class="section-head"><h2>Práticas</h2></div><div class="lesson-list">${practices.map((p,i) => lessonRow(p,i)).join('')}</div></section>` : ''}
      ${readings.length ? `<section class="section"><div class="section-head"><h2>Leituras</h2></div><div class="reading-grid">${readings.map(readingCard).join('')}</div></section>` : ''}`;
  }

  function render() {
    const name = route(); setRouteActive(name);
    if (name === 'jornada') renderJourney(location.hash.split('/')[1]);
    else if (name === 'leituras') renderReadings();
    else if (name === 'favoritos') renderFavorites();
    else renderHome();
    updateProgress();
    app.focus({ preventScroll: true });
  }

  function playPractice(id) {
    const practice = practiceById(id); if (!practice?.audio) return;
    const changed = state.currentAudio?.id !== practice.id;
    state.currentAudio = practice;
    if (changed) { audio.src = practice.audio; audio.load(); }
    $('#player').hidden = false;
    $('#playerTitle').textContent = practice.title;
    $('#playerModule').textContent = `${moduleById(practice.module)?.title || 'Bônus'} · ${practice.label}`;
    updateMediaSession(practice);
    updateOfflineButton(practice);
    updateTranscriptButton(practice);
    audio.play().catch(() => {});
    updatePlayerButton();
  }
  function updatePlayerButton() { $('#playButton').textContent = audio.paused ? '▶' : 'Ⅱ'; }
  function adjacentTrack(direction) {
    if (!state.currentAudio) return;
    const i = availablePractices.findIndex(p => p.id === state.currentAudio.id);
    playPractice(availablePractices[(i + direction + availablePractices.length) % availablePractices.length].id);
  }

  function updateMediaSession(practice) {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: practice.title,
      artist: 'Daniel H Aragão',
      album: `Relivn · ${moduleById(practice.module)?.title || 'Meditações'}`,
      artwork: [
        { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    });
  }

  async function requestWakeLock() {
    if (!('wakeLock' in navigator) || state.wakeLock) return false;
    try {
      state.wakeLock = await navigator.wakeLock.request('screen');
      state.wakeLock.addEventListener('release', () => { state.wakeLock = null; updateWakeButton(); }, { once: true });
      updateWakeButton();
      return true;
    } catch { updateWakeButton(); return false; }
  }
  async function releaseWakeLock() {
    if (state.wakeLock) await state.wakeLock.release();
    state.wakeLock = null;
    updateWakeButton();
  }
  function updateWakeButton() {
    const button = $('#wakeButton');
    const enabled = localStorage.getItem('relivn-wake-enabled') === 'true';
    button.classList.toggle('on', enabled && Boolean(state.wakeLock));
    button.textContent = enabled && state.wakeLock ? '☀' : '☼';
    button.title = !('wakeLock' in navigator) ? 'Não suportado neste navegador' : enabled ? 'Permitir que a tela apague' : 'Manter tela ligada';
  }

  async function updateOfflineButton(practice = state.currentAudio) {
    const button = $('#offlineButton');
    if (!practice || !('caches' in window)) { button.disabled = true; return; }
    const cache = await caches.open('relivn-audio-v1');
    const cached = await cache.match(new URL(practice.audio, location.href).href);
    button.disabled = false;
    button.classList.toggle('on', Boolean(cached));
    button.textContent = cached ? '✓' : '⇩';
    button.title = cached ? 'Disponível offline' : 'Baixar para ouvir offline';
  }
  async function downloadCurrentAudio() {
    if (!state.currentAudio || !('caches' in window)) return;
    const button = $('#offlineButton');
    if (button.classList.contains('on')) return;
    button.disabled = true; button.textContent = '…'; button.title = 'Baixando áudio';
    try {
      const url = new URL(state.currentAudio.audio, location.href).href;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const cache = await caches.open('relivn-audio-v1');
      await cache.put(url, response);
      await updateOfflineButton();
    } catch {
      button.textContent = '!'; button.title = 'Não foi possível baixar'; button.disabled = false;
    }
  }

  function openReading(id) {
    const r = readingById(id); if (!r) return;
    state.currentReading = r;
    $('#readerTitle').textContent = r.title;
    $('#readerModule').textContent = moduleById(r.module)?.title || 'Leitura complementar';
    $('#readerBody').innerHTML = r.html;
    $('#readerModal').hidden = false;
    document.body.style.overflow = 'hidden';
    const done = state.completed.has(`reading:${r.id}`);
    $('#completeReading').textContent = done ? '✓ Leitura concluída' : 'Marcar como lida';
    $('.reader-panel').scrollTop = 0;
  }
  function closeReading() { $('#readerModal').hidden = true; document.body.style.overflow = ''; state.currentReading = null; }
  function updateTranscriptButton(practice = state.currentAudio) {
    const button = $('#transcriptButton');
    const available = Boolean(transcriptFor(practice));
    button.disabled = !available;
    button.title = available ? 'Abrir transcrição com tempos' : 'Transcrição indisponível';
  }
  function openTranscript(id = state.currentAudio?.id) {
    const practice = practiceById(id);
    const transcript = transcriptFor(practice);
    if (!practice || !transcript) return;
    state.currentTranscript = { practice, transcript };
    $('#transcriptTitle').textContent = practice.title;
    $('#transcriptModule').textContent = `${moduleById(practice.module)?.title || 'Meditação'} · TRANSCRIÇÃO LITERAL`;
    $('#transcriptBody').innerHTML = transcript.segments.map((segment, index) => `
      <button class="transcript-segment" data-seek-time="${segment.start}" data-segment-index="${index}">
        <span class="transcript-time">${escapeHTML(segment.startLabel)} → ${escapeHTML(segment.endLabel)}</span>
        <span class="transcript-text">${escapeHTML(segment.text)}</span>
      </button>`).join('');
    $('#transcriptModal').hidden = false;
    document.body.style.overflow = 'hidden';
    updateActiveTranscriptSegment();
    $('.transcript-panel').scrollTop = 0;
  }
  function closeTranscript() {
    $('#transcriptModal').hidden = true;
    document.body.style.overflow = '';
    state.currentTranscript = null;
  }
  function updateActiveTranscriptSegment() {
    if (!state.currentTranscript || $('#transcriptModal').hidden || state.currentAudio?.id !== state.currentTranscript.practice.id) return;
    const segments = state.currentTranscript.transcript.segments;
    let active = -1;
    for (let i = 0; i < segments.length; i += 1) {
      if (audio.currentTime >= segments[i].start && audio.currentTime < segments[i].end) { active = i; break; }
    }
    $$('.transcript-segment').forEach((element, index) => element.classList.toggle('active', index === active));
  }
  function toggleFavorite(key) { state.favorites.has(key) ? state.favorites.delete(key) : state.favorites.add(key); save(); render(); }

  document.addEventListener('click', e => {
    const play = e.target.closest('[data-play]'); if (play) return playPractice(play.dataset.play);
    const read = e.target.closest('[data-read]'); if (read) return openReading(read.dataset.read);
    const transcript = e.target.closest('[data-transcript]'); if (transcript) return openTranscript(transcript.dataset.transcript);
    const fav = e.target.closest('[data-favorite]'); if (fav) return toggleFavorite(fav.dataset.favorite);
    const go = e.target.closest('[data-go]'); if (go) { location.hash = go.dataset.go; return; }
    const module = e.target.closest('[data-module]'); if (module) { location.hash = `jornada/${module.dataset.module}`; return; }
    const filter = e.target.closest('[data-reading-filter]'); if (filter) return renderReadings(filter.dataset.readingFilter);
    if (e.target.closest('[data-close-modal]')) closeReading();
    if (e.target.closest('[data-close-transcript]')) closeTranscript();
    const seek = e.target.closest('[data-seek-time]');
    if (seek && state.currentTranscript) {
      const practice = state.currentTranscript.practice;
      const seekTime = Number(seek.dataset.seekTime);
      const applySeek = () => { audio.currentTime = seekTime; audio.play().catch(() => {}); updateActiveTranscriptSegment(); };
      if (state.currentAudio?.id !== practice.id) {
        playPractice(practice.id);
        if (audio.readyState >= 1) applySeek();
        else audio.addEventListener('loadedmetadata', applySeek, { once: true });
      } else applySeek();
    }
  });
  window.addEventListener('hashchange', render);
  $('#menuButton').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $$('.main-nav a').forEach(a => a.addEventListener('click', () => $('#sidebar').classList.remove('open')));
  $('#playButton').addEventListener('click', () => audio.paused ? audio.play() : audio.pause());
  $('#prevButton').addEventListener('click', () => adjacentTrack(-1));
  $('#nextButton').addEventListener('click', () => adjacentTrack(1));
  $('#offlineButton').addEventListener('click', downloadCurrentAudio);
  $('#transcriptButton').addEventListener('click', () => openTranscript());
  $('#wakeButton').addEventListener('click', async () => {
    const enabled = localStorage.getItem('relivn-wake-enabled') === 'true';
    localStorage.setItem('relivn-wake-enabled', String(!enabled));
    if (enabled) await releaseWakeLock();
    else if (!audio.paused) await requestWakeLock();
    updateWakeButton();
  });
  audio.addEventListener('play', () => {
    updatePlayerButton();
    if (localStorage.getItem('relivn-wake-enabled') === 'true') requestWakeLock();
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
  });
  audio.addEventListener('pause', () => {
    updatePlayerButton(); saveAudioPosition(true); releaseWakeLock();
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
  });
  audio.addEventListener('loadedmetadata', () => {
    $('#duration').textContent = formatTime(audio.duration);
    const position = state.currentAudio ? savedPositions()[state.currentAudio.id] : 0;
    if (position > 0 && position < audio.duration - 10) audio.currentTime = position;
    state.lastPositionSave = audio.currentTime;
  });
  audio.addEventListener('timeupdate', () => {
    $('#currentTime').textContent = formatTime(audio.currentTime);
    $('#seek').value = audio.duration ? audio.currentTime / audio.duration * 100 : 0;
    saveAudioPosition();
    updateActiveTranscriptSegment();
    if ('mediaSession' in navigator && audio.duration && navigator.mediaSession.setPositionState) {
      try { navigator.mediaSession.setPositionState({ duration: audio.duration, playbackRate: audio.playbackRate, position: Math.min(audio.currentTime, audio.duration) }); } catch { /* metadados ainda carregando */ }
    }
  });
  audio.addEventListener('ended', () => {
    if (!state.currentAudio) return;
    const positions = savedPositions(); delete positions[state.currentAudio.id];
    localStorage.setItem('relivn-audio-positions', JSON.stringify(positions));
    state.completed.add(`practice:${state.currentAudio.id}`); save(); render(); adjacentTrack(1);
  });
  $('#seek').addEventListener('input', e => { if (audio.duration) audio.currentTime = Number(e.target.value) / 100 * audio.duration; });
  $('#volume').addEventListener('input', e => audio.volume = Number(e.target.value)); audio.volume = .9;
  $('#speedButton').addEventListener('click', () => { const speeds = [1, 1.25, 1.5, .75]; state.speedIndex = (state.speedIndex + 1) % speeds.length; audio.playbackRate = speeds[state.speedIndex]; $('#speedButton').textContent = `${speeds[state.speedIndex]}×`; });
  $('#completeReading').addEventListener('click', () => { if (!state.currentReading) return; const key = `reading:${state.currentReading.id}`; state.completed.add(key); save(); $('#completeReading').textContent = '✓ Leitura concluída'; });
  $('.reader-panel').addEventListener('scroll', e => { const el = e.currentTarget; const max = el.scrollHeight - el.clientHeight; $('#readerProgress').style.width = `${max ? el.scrollTop / max * 100 : 100}%`; });

  const searchOverlay = $('#searchOverlay'), searchInput = $('#globalSearch');
  function openSearch() { searchOverlay.hidden = false; setTimeout(() => searchInput.focus(), 0); }
  function closeSearch() { searchOverlay.hidden = true; searchInput.value = ''; $('#searchResults').innerHTML = ''; }
  $('#searchButton').addEventListener('click', openSearch); $('#closeSearch').addEventListener('click', closeSearch);
  searchInput.addEventListener('input', e => {
    const q = e.target.value.toLocaleLowerCase('pt-BR').trim();
    if (!q) { $('#searchResults').innerHTML = ''; return; }
    const p = availablePractices.filter(x => `${x.title} ${moduleById(x.module)?.title}`.toLocaleLowerCase('pt-BR').includes(q)).slice(0,5);
    const r = data.readings.filter(x => `${x.title} ${x.excerpt}`.toLocaleLowerCase('pt-BR').includes(q)).slice(0,7);
    $('#searchResults').innerHTML = [...p.map(x => `<button class="search-result" data-search-play="${x.id}"><span>${escapeHTML(x.title)}</span><small>Prática · ${formatTime(x.duration)}</small></button>`), ...r.map(x => `<button class="search-result" data-search-read="${x.id}"><span>${escapeHTML(x.title)}</span><small>Leitura · ${readingMinutes(x)} min</small></button>`)].join('') || '<p>Nenhum resultado encontrado.</p>';
  });
  $('#searchResults').addEventListener('click', e => { const p = e.target.closest('[data-search-play]'), r = e.target.closest('[data-search-read]'); if (p) { closeSearch(); playPractice(p.dataset.searchPlay); } if (r) { closeSearch(); openReading(r.dataset.searchRead); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!searchOverlay.hidden) closeSearch(); else if (!$('#transcriptModal').hidden) closeTranscript(); else if (!$('#readerModal').hidden) closeReading(); } });

  if ('mediaSession' in navigator) {
    const actions = {
      play: () => audio.play(), pause: () => audio.pause(),
      previoustrack: () => adjacentTrack(-1), nexttrack: () => adjacentTrack(1),
      seekbackward: details => { audio.currentTime = Math.max(0, audio.currentTime - (details.seekOffset || 15)); },
      seekforward: details => { audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + (details.seekOffset || 15)); },
      seekto: details => { if (details.seekTime != null) audio.currentTime = details.seekTime; }
    };
    Object.entries(actions).forEach(([name, handler]) => { try { navigator.mediaSession.setActionHandler(name, handler); } catch { /* ação não suportada */ } });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !audio.paused && localStorage.getItem('relivn-wake-enabled') === 'true') requestWakeLock();
  });
  window.addEventListener('beforeunload', () => saveAudioPosition(true));

  const installButton = $('#installButton');
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); state.installPrompt = event; installButton.hidden = false;
  });
  if (isIOS && !isStandalone) installButton.hidden = false;
  installButton.addEventListener('click', async () => {
    if (state.installPrompt) {
      state.installPrompt.prompt(); await state.installPrompt.userChoice;
      state.installPrompt = null; installButton.hidden = true;
    } else if (isIOS) {
      alert('No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.');
    }
  });
  window.addEventListener('appinstalled', () => { installButton.hidden = true; state.installPrompt = null; });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./service-worker.js').catch(error => console.warn('Modo offline indisponível:', error));
  }

  updateWakeButton(); updateTranscriptButton(); updateProgress(); render();
})();
