const favorites = new Set();

const grid   = document.getElementById('grid');
const searchInput = document.getElementById('searchInput');
const sortSelect  = document.getElementById('sortSelect');
const genrePills  = document.getElementById('genrePills');
const countTag    = document.getElementById('countTag');
const themeBtn    = document.getElementById('themeBtn');
const themeMedia  = window.matchMedia('(prefers-color-scheme: dark)');

function getPreferredTheme() {
  return localStorage.getItem('theme') || (themeMedia.matches ? 'dark' : 'light');
}

function updateThemeButton(theme) {
  themeBtn.textContent = theme === 'dark' ? '☀ Light' : '☾ Dark';
  themeBtn.setAttribute('aria-pressed', String(theme === 'dark'));
}

function setTheme(theme, persist = true) {
  document.documentElement.setAttribute('data-theme', theme);
  if (persist) {
    localStorage.setItem('theme', theme);
  }
  updateThemeButton(theme);
}

function buildPills() {
  const genres = ['All', ...new Set(tracks.map(t => t.genre))].sort((a, b) =>
    a === 'All' ? -1 : a.localeCompare(b)
  );

  genrePills.innerHTML = '';

  genres.forEach(g => {
    const pill = document.createElement('div');
    pill.className = 'pill' + (g === 'All' ? ' active' : '');
    pill.textContent = g;
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      applyFilters();
    });
    genrePills.appendChild(pill);
  });
}

function applyFilters() {
  const q     = searchInput.value.toLowerCase();
  const genre = document.querySelector('.pill.active')?.textContent || 'All';
  const sort  = sortSelect.value;

  let data = tracks.filter(t => {
    const matchGenre  = genre === 'All' || t.genre === genre;
    const matchSearch = !q
      || t.title.toLowerCase().includes(q)
      || t.artist.toLowerCase().includes(q)
      || t.album.toLowerCase().includes(q);
    return matchGenre && matchSearch;
  });

  switch (sort) {
    case 'az':      data.sort((a, b) => a.title.localeCompare(b.title));                    break;
    case 'za':      data.sort((a, b) => b.title.localeCompare(a.title));                    break;
    case 'artist':  data.sort((a, b) => a.artist.localeCompare(b.artist));                  break;
    case 'newest':  data.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)); break;
    case 'oldest':  data.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate)); break;
    case 'price':   data.sort((a, b) => a.price - b.price);                                 break;
    case 'duration':data.sort((a, b) => a.duration - b.duration);                           break;
  }

  countTag.innerHTML = `<strong>${data.length}</strong> track${data.length !== 1 ? 's' : ''}`;
  renderCards(data);
}

function renderCards(data) {
  grid.innerHTML = '';

  if (!data.length) {
    grid.innerHTML = `
      <div class="empty">
        <span class="empty-dots">…</span>
        <p>Nothing found. Try a different search or genre.</p>
      </div>`;
    return;
  }

  data.forEach((track, i) => {
    const isFav = favorites.has(track.id);
    const card  = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${i * 0.04}s`;

    card.innerHTML = `
      <div class="card-art">
        <img
          src="${track.art}"
          alt="${track.artist}"
          loading="lazy"
          onerror="this.src='https://picsum.photos/seed/${track.id}/300/300'"
        />
        <div class="card-overlay">
          <div class="duration-tag">${fmt(track.duration)}</div>
          <div class="play-btn" data-id="${track.id}">▶</div>
        </div>
        ${track.explicit ? '<div class="explicit-badge">E</div>' : ''}
        <div class="fav-btn ${isFav ? 'active' : ''}" data-fav="${track.id}">♥</div>
      </div>
      <div class="card-body">
        <div class="card-album">${track.album}</div>
        <div class="card-title">${track.title}</div>
        <div class="card-artist">${track.artist}</div>
        <div class="card-footer">
          <span class="genre-pill">${track.genre}</span>
          <span class="price-tag">$${track.price.toFixed(2)}</span>
        </div>
      </div>`;

    card.querySelector('.play-btn').addEventListener('click', e => {
      e.stopPropagation();
      playTrack(track);
    });
    card.addEventListener('click', () => playTrack(track));

    card.querySelector('.fav-btn').addEventListener('click', e => {
      e.stopPropagation();
      const btn = e.currentTarget;
      if (favorites.has(track.id)) {
        favorites.delete(track.id);
        btn.classList.remove('active');
      } else {
        favorites.add(track.id);
        btn.classList.add('active');
      }
    });

    grid.appendChild(card);
  });
}

themeBtn.addEventListener('click', () => {
  const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
});

themeMedia.addEventListener('change', event => {
  if (localStorage.getItem('theme')) {
    return;
  }
  const theme = event.matches ? 'dark' : 'light';
  setTheme(theme, false);
});

searchInput.addEventListener('input', applyFilters);
sortSelect.addEventListener('change', applyFilters);

setTheme(getPreferredTheme(), Boolean(localStorage.getItem('theme')));
buildPills();
applyFilters();
