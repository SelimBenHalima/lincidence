(function(){
  const esc = s => String(s ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const attr = s => esc(s).replace(/'/g, '&#39;');
  const link = e => `episode.html?episode=${encodeURIComponent(e.slug)}`;

  function formatDate(value){
    if(!value) return '';
    const d = new Date(value + (String(value).length === 10 ? 'T00:00:00' : ''));
    if(Number.isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat('fr-FR', {day:'numeric', month:'long', year:'numeric'}).format(d);
  }

  function sortEpisodes(items){
    return [...items].sort((a,b) => {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      return db - da;
    });
  }

  function imageMarkup(e, className){
    return e.image
      ? `<img class="${className}" src="${attr(e.image)}" alt="${attr(e.title)}">`
      : `<div class="${className} image-placeholder">Image de l’épisode</div>`;
  }

  function audioMarkup(e){
    if(!e.audio) return `<div class="audio audio-placeholder">Le fichier audio sera ajouté prochainement.</div>`;
    return `<div class="audio"><audio controls preload="metadata" src="${attr(e.audio)}">Votre navigateur ne prend pas en charge la lecture audio.</audio></div>`;
  }

  function listMarkup(items){
    return items.map(e => `
      <article class="episode-row">
        ${imageMarkup(e, 'episode-thumb')}
        <a class="play" href="${link(e)}" aria-label="Ouvrir ${esc(e.title)}"><span class="play-dot">▶</span></a>
        <div>
          <div class="kicker">Épisode ${esc(e.number)}</div>
          <h3><a href="${link(e)}">${esc(e.title)}</a></h3>
          <p>${esc(e.summary)}</p>
          <div class="episode-meta">${esc(e.duration)} · ${esc(formatDate(e.date))}</div>
        </div>
      </article>`).join('');
  }

  async function loadEpisodes(){
    const response = await fetch('content/episodes.json', {cache:'no-store'});
    if(!response.ok) throw new Error('Impossible de charger content/episodes.json');
    return sortEpisodes(await response.json());
  }

  function render(episodes){
    const bySlug = slug => episodes.find(e => e.slug === slug);
    const latest = episodes[0];

    const home = document.querySelector('[data-episodes-home]');
    if(home){
      if(!latest){ home.innerHTML = '<p>Aucun épisode publié.</p>'; }
      else home.innerHTML = `
        <section class="hero-episode">
          ${imageMarkup(latest, 'hero-image')}
          <div>
            <div class="kicker">Épisode ${esc(latest.number)}</div>
            <h1>${esc(latest.title)}</h1>
            <p class="lead">${esc(latest.summary)}</p>
            <div class="episode-meta">${esc(latest.duration)} · ${esc(formatDate(latest.date))}</div>
            <a class="play" href="${link(latest)}"><span class="play-dot">▶</span> Écouter l’épisode</a>
          </div>
        </section>
        <section class="section">
          <div class="section-head"><h2>Derniers épisodes</h2><a href="podcast.html">Voir tous les épisodes →</a></div>
          <div class="episode-list">${listMarkup(episodes)}</div>
        </section>`;
    }

    const archive = document.querySelector('[data-episodes-archive]');
    if(archive){
      const grouped = episodes.reduce((acc,e) => {
        const season = e.season || 'Saison 1';
        (acc[season] ||= []).push(e);
        return acc;
      }, {});
      archive.innerHTML = Object.entries(grouped).map(([season,items]) => `
        <section class="section season-section">
          <div class="section-head"><h2>${esc(season)}</h2><span class="footer-small">${items.length} épisode${items.length>1?'s':''}</span></div>
          <div class="episode-list">${listMarkup(items)}</div>
        </section>`).join('');
    }

    const detail = document.querySelector('[data-episode-detail]');
    if(detail){
      const slug = new URLSearchParams(location.search).get('episode') || latest?.slug;
      const e = bySlug(slug);
      if(!e){ detail.innerHTML='<p>Épisode introuvable.</p>'; return; }
      document.title = `${e.title} — L’Incidence`;
      const chapters = (e.chapters || []).filter(c => c.time || c.title);
      const sources = (e.sources || []).filter(s => s.title || s.url);
      detail.innerHTML = `
        <a class="back" href="podcast.html">← Retour au podcast</a>
        <div class="kicker" style="margin-top:30px">Épisode ${esc(e.number)} · ${esc(e.season)}</div>
        <h1>${esc(e.title)}</h1>
        <p class="lead">${esc(e.summary)}</p>
        <div class="episode-meta">${esc(e.duration)} · ${esc(formatDate(e.date))}</div>
        ${imageMarkup(e, 'detail-image')}
        ${audioMarkup(e)}
        <div class="content">
          <h2>À propos de cet épisode</h2>
          <div>${e.description || '<p>Contenu à venir.</p>'}</div>
          ${chapters.length ? `<h2>Chapitres</h2><ol>${chapters.map(c=>`<li><strong>${esc(c.time)}</strong> — ${esc(c.title)}</li>`).join('')}</ol>` : ''}
          ${sources.length ? `<h2>Pour aller plus loin</h2><ul>${sources.map(s=>`<li>${s.url ? `<a href="${attr(s.url)}" target="_blank" rel="noopener">${esc(s.title || s.url)}</a>` : esc(s.title)}</li>`).join('')}</ul>` : ''}
        </div>`;
    }
  }

  loadEpisodes().then(render).catch(error => {
    console.error(error);
    const targets = document.querySelectorAll('[data-episodes-home],[data-episodes-archive],[data-episode-detail]');
    targets.forEach(target => target.innerHTML = '<p>Le contenu des épisodes n’est pas disponible dans cette prévisualisation. Utilisez un serveur local ou publiez le site.</p>');
  });
})();
