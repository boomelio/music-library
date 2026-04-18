let tracks = [];

async function initData() {
  try {
    const res = await fetch("https://itunes.apple.com/search?term=pop&media=music&limit=20");
    const data = await res.json();
    tracks = data.results.map(t => ({
      id: t.trackId,
      title: t.trackName || "Unknown",
      artist: t.artistName || "Unknown",
      album: t.collectionName || "Unknown",
      art: (t.artworkUrl100 || "").replace('100x100', '300x300'),
      genre: t.primaryGenreName || "Unknown",
      price: t.trackPrice || 0,
      duration: t.trackTimeMillis || 0,
      explicit: t.trackExplicitness === "explicit",
      releaseDate: t.releaseDate,
      preview: t.previewUrl
    }));
  } catch (err) {
    console.error("Failed to load tracks", err);
  }
}
