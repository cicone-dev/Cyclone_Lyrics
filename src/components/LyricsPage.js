import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

function LyricsPage({ currentSong, lyrics, artistInfo, videoId, translateLyrics }) {
  const [isTranslating, setIsTranslating] = useState(false);
  
  // YouTube player
  useEffect(() => {
    if (!videoId) return;
    
    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    // Clean up
    return () => {
      // Remove the YouTube API script when component unmounts
      const youtubeScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (youtubeScript) {
        youtubeScript.remove();
      }
    };
  }, [videoId]);

  const handleTranslate = async () => {
    setIsTranslating(true);
    await translateLyrics();
    setIsTranslating(false);
  };

  // Função para obter a imagem do artista
  const getArtistImage = () => {
    // Verifica se temos uma URL de imagem válida
    if (artistInfo?.imageUrl && typeof artistInfo.imageUrl === 'string' && artistInfo.imageUrl.trim() !== '') {
      return artistInfo.imageUrl;
    }
    
    // Se não tiver imagem do artista, tenta usar a imagem do primeiro álbum se disponível
    if (artistInfo?.albums && artistInfo.albums.length > 0 && artistInfo.albums[0].imageUrl) {
      return artistInfo.albums[0].imageUrl;
    }
    
    // Fallback para a imagem padrão
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop';
  };

  return (
    <div id="lyricsPage" className="page">
      <div className="lyrics-container">
        <div className="lyrics-content">
          <h1 id="songTitle">{currentSong}</h1>
          <div className="lyrics-controls">
            <button 
              id="translateBtn" 
              className="translate-button"
              onClick={handleTranslate}
              disabled={isTranslating}
            >
              <Globe size={24} />
              {isTranslating ? 'Translating...' : 'Translate'}
            </button>
          </div>
          <div id="lyricsText" className="lyrics-text">
            {lyrics || 'Loading lyrics...'}
          </div>
        </div>

        <div className="media-section">
          <div className="video-container">
            <h2>Music Video</h2>
            {videoId ? (
              <div className="youtube-player-container">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <p>Video not available</p>
            )}
          </div>

          <div className="artist-info">
            <h2>About the Artist</h2>
            <div id="artistContent" className="artist-content">
              <div className="artist-header">
                <img 
                  id="artistImage" 
                  src={getArtistImage()} 
                  alt={artistInfo?.name || 'Artist'} 
                  className="artist-image"
                  onError={(e) => {
                    const img = e.target;
                    if (img instanceof HTMLImageElement) {
                      // Tenta primeiramente usar a imagem do primeiro álbum se disponível
                      if (artistInfo?.albums && artistInfo.albums.length > 0 && artistInfo.albums[0].imageUrl) {
                        img.src = artistInfo.albums[0].imageUrl;
                      } else {
                        // Se não houver imagem do álbum, usa a imagem alternativa de artista
                        img.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop';
                      }
                    }
                  }}
                />
                <h3 id="artistName">{artistInfo?.name || 'Unknown Artist'}</h3>
              </div>
              <p id="artistBio" className="artist-bio">
                {artistInfo?.bio || 'Artist information not available.'}
              </p>
              <div id="artistAlbums" className="artist-albums">
                <h4>Popular Albums</h4>
                <div className="albums-grid">
                  {artistInfo?.albums?.map((album, index) => (
                    <div key={index} className="album-card">
                      <img 
                        src={album.imageUrl} 
                        alt={album.name}
                        onError={(e) => {
                          const img = e.target;
                          if (img instanceof HTMLImageElement) {
                            img.src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop';
                          }
                        }}                     
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LyricsPage;