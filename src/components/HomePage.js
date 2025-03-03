import React from 'react';
import { Music } from 'lucide-react';
import { GENRES } from '../config';

function HomePage({ 
  topSongs, 
  navigateToLyrics, 
  loadRandomSongByGenre, 
  searchResults 
}) {
  // Função para tratamento de erro de imagem com múltiplos fallbacks
  const handleImageError = (e) => {
    const img = e.target;
    if (img instanceof HTMLImageElement) {
      // Verifica se já tentamos o fallback principal
      if (img.getAttribute('data-tried-main-fallback') === 'true') {
        // Se já tentou o principal, usa o último fallback
        img.src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop';
        // Não faz mais tentativas
        img.onerror = null;
      } else {
        // Marca que tentamos o fallback principal
        img.setAttribute('data-tried-main-fallback', 'true');
        // Tenta um fallback específico para músicas
        img.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop';
      }
    }
  };

  // Se temos resultados de pesquisa, mostramos eles
  if (searchResults && searchResults.length > 0) {
    return (
      <div id="homePage" className="page">
        <div className="search-results">
          {searchResults.map((result, index) => (
            <div 
              key={index} 
              className="search-result-item" 
              onClick={() => navigateToLyrics(`${result.artist} - ${result.title}`)}
            >
              <img 
                src={result.imageUrl} 
                alt={result.title} 
                onError={handleImageError}
              />
              <div className="result-info">
                <h3>{result.title}</h3>
                <p>{result.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="homePage" className="page">
      <section id="topSongs" className="top-songs-section">
        <h2>Top 10 Global Hits</h2>
        <div className="songs-grid">
          {topSongs.map((song, index) => (
            <div 
              key={index} 
              className="song-card" 
              onClick={() => navigateToLyrics(`${song.artist} - ${song.title}`)}
            >
              <img 
                src={song.imageUrl} 
                alt={song.title}
                onError={handleImageError}
              />
              <div className="song-overlay">
                <div className="song-info">
                  <h3>{song.title}</h3>
                  <p>{song.artist}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="genres" className="genres-section">
        <h2>Browse by Genre</h2>
        <div className="genres-grid">
          {GENRES.map((genre) => (
            <button 
              key={genre.id} 
              className="genre-card" 
              style={{ backgroundColor: genre.color }} 
              onClick={() => loadRandomSongByGenre(genre.id)}
            >
              <Music size={32} />
              <span>{genre.name}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;