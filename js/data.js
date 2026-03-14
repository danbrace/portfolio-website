/**
 * Data loading and rendering — fetches data.json and then renders content into the page.
 */

async function loadData() {
  try {
    const d = await fetch('data.json').then(r => r.json());
    if (d.hero) renderHero(d.hero);
    if (d.about) renderAbout(d.about);
    if (d.experience) renderExperience(d.experience);
    if (d.projects) renderProjects(d.projects);
    if (d.skills) renderSkills(d.skills);
    if (d.contact) renderContact(d.contact);
  } catch (e) {
    console.warn('Could not load data.json');
  }
  loadCloudinaryPhotos();
}

function renderHero(h) {
  if (typeof h.kicker === 'string') {
    const el = document.getElementById('hero-kicker');
    if (el) el.textContent = h.kicker;
  }
  if (typeof h.titleHtml === 'string') {
    const el = document.getElementById('hero-title');
    if (el) el.innerHTML = h.titleHtml;
  }
  if (typeof h.roleHtml === 'string') {
    const el = document.getElementById('hero-role');
    if (el) el.innerHTML = h.roleHtml;
  }
  if (typeof h.description === 'string') {
    const el = document.getElementById('hero-desc');
    if (el) el.textContent = h.description;
  }
}

function renderAbout(a) {
  if (a.bio) document.getElementById('about-bio').innerHTML =
    a.bio.split('\n').map(p => p.trim()).filter(Boolean).join('<br><br>');
}

function getTagStrings(tags) {
  if (!tags || !Array.isArray(tags)) return [];
  return tags.map(t => (typeof t === 'string' ? t : (t && t.tag) || '')).filter(Boolean);
}

function renderExperience(items) {
  document.getElementById('experience-list').innerHTML = items.map(e => `
    <div class="exp-row">
      <div class="exp-period">${e.period}</div>
      <div class="exp-body">
        <div class="role">${e.role}</div>
        <div class="company">${e.company}</div>
        <div class="desc">${e.description}</div>
        <div class="tags">${getTagStrings(e.tags).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>
    </div>`).join('');
}

function renderProjects(items) {
  document.getElementById('projects-list').innerHTML = items.map((p, i) => `
    <a class="project-row" ${p.link ? `href="${p.link}" target="_blank" rel="noopener"` : 'href="#projects"'}>
      <span class="project-num">0${i + 1}</span>
      <div>
        <div class="project-title">${p.title}</div>
        <div class="project-desc">${p.description}</div>
        <div class="tags" style="margin-top:.7rem">${getTagStrings(p.tags).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>
      <span class="project-arrow">${p.link ? '↗' : ''}</span>
    </a>`).join('');
}

function dots(level) {
  // Expect 1–5; clamp just in case
  const n = Math.min(5, Math.max(1, Math.round(level || 0)));
  return Array.from({ length: 5 }, (_, i) => `<span class="dot${i < n ? ' on' : ''}"></span>`).join('');
}

function renderSkills(groups) {
  document.getElementById('skills-grid').innerHTML = groups.map(g => `
    <div class="skill-group">
      <div class="skill-group-name">${g.group}</div>
      ${(g.items || []).map(s => `
        <div class="skill-item">
          <span>${s.name}</span>
          <div class="skill-dots">${dots(s.level)}</div>
        </div>`).join('')}
    </div>`).join('');
}

function renderContact(c) {
  const links = [];
  if (c.email) links.push({ l: 'Email', v: c.email, h: `mailto:${c.email}` });
  if (c.linkedin) links.push({ l: 'LinkedIn', v: `linkedin.com/in/${c.linkedin}`, h: `https://linkedin.com/in/${c.linkedin}` });
  if (c.github) links.push({ l: 'GitHub', v: `github.com/${c.github}`, h: `https://github.com/${c.github}` });
  document.getElementById('contact-list').innerHTML = links.map(l => `
    <a class="contact-item" href="${l.h}" target="_blank" rel="noopener">
      <span>${l.l}</span>
      <span class="contact-item-value">${l.v}</span>
    </a>`).join('');
}
