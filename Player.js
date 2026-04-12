const audio = document.getElementById('audioPlayer');

let currentTrack = null;
let isPlaying = false;
let progressInterval = null;

const miniPlayer    = document.getElementById('miniPlayer');
const playerArt     = document.getElementById('playerArt');
const playerAlbum   = document.getElementById('playerAlbum');
const playerTitle   = document.getElementById('playerTitle');
const playerArtist  = document.getElementById('playerArtist');
const progressFill  = document.getElementById('progressFill');
const progressTime  = document.getElementById('progressTime');
const progressBar   = document.getElementById('progressBar');
const playPauseBtn  = document.getElementById('playPauseBtn');
const closePlayer   = document.getElementById('closePlayer');

function fmt(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function fmtSec(sec) {
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
}

function startProgress() {
  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = pct + '%';
    progressTime.textContent = fmtSec(audio.currentTime);
  }, 500);
}

function playTrack(track) {
  currentTrack = track;
  audio.src = track.preview;

  playerArt.src          = track.art;
  playerAlbum.textContent  = track.album;
  playerTitle.textContent  = track.title;
  playerArtist.textContent = track.artist;
  progressFill.style.width = '0%';
  progressTime.textContent = '0:00';

  miniPlayer.classList.add('visible');

  audio.play()
    .then(() => {
      isPlaying = true;
      playPauseBtn.textContent = '⏸';
      startProgress();
    })
    .catch(() => {
     
      playPauseBtn.textContent = '▶';
      isPlaying = false;
    });
}

playPauseBtn.addEventListener('click', () => {
  if (!currentTrack) return;
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    playPauseBtn.textContent = '▶';
    clearInterval(progressInterval);
  } else {
    audio.play();
    isPlaying = true;
    playPauseBtn.textContent = '⏸';
    startProgress();
  }
});

audio.addEventListener('ended', () => {
  isPlaying = false;
  playPauseBtn.textContent = '▶';
  progressFill.style.width = '100%';
  clearInterval(progressInterval);
});

closePlayer.addEventListener('click', () => {
  audio.pause();
  audio.src = '';
  isPlaying = false;
  clearInterval(progressInterval);
  miniPlayer.classList.remove('visible');
});

progressBar.addEventListener('click', (e) => {
  if (!audio.duration) return;
  const rect = progressBar.getBoundingClientRect();
  const pct  = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
});
