import { API_KEYS } from './config';

// Função utilitária para obter imagens válidas da Last.fm
// Função utilitária para obter imagens válidas da Last.fm
const getValidImage = (imageArray) => {
    if (!imageArray || !Array.isArray(imageArray) || imageArray.length === 0) return null;
    
    // Filtra para remover a imagem padrão da Last.fm
    const filteredImages = imageArray.filter(img => 
        img && 
        img['#text'] && 
        img['#text'].length > 10 &&
        !img['#text'].includes('2a96cbd8b46e442fc41c2b86b821562f')
    );
    
    // Pega a maior imagem disponível ou retorna null se não houver imagens válidas
    return filteredImages.length > 0 
        ? filteredImages[filteredImages.length - 1]['#text'] 
        : null;
};

// Fallback image URLs
const DEFAULT_ARTIST_IMAGE = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop';
const DEFAULT_ALBUM_IMAGE = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop';
const DEFAULT_TRACK_IMAGE = 'https://via.placeholder.com/300';

// API Calls
// API Calls
export async function fetchTopSongs() {
    try {
        const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${API_KEYS.lastfm}&format=json&limit=10`);
        if (!response.ok) throw new Error('Failed to fetch top songs');
        
        const data = await response.json();
        const tracks = data.tracks.track;
        
        const formattedTracks = await Promise.all(tracks.map(async (track) => {
            let imageUrl = getValidImage(track.image);
            
            // Se não conseguir a imagem da música, tenta obter do álbum
            if (!imageUrl) {
                try {
                    // Busca informações do álbum da música
                    const trackInfoResponse = await fetch(
                        `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${API_KEYS.lastfm}&artist=${encodeURIComponent(track.artist.name)}&track=${encodeURIComponent(track.name)}&format=json`
                    );
                    
                    if (trackInfoResponse.ok) {
                        const trackInfo = await trackInfoResponse.json();
                        if (trackInfo.track && trackInfo.track.album) {
                            imageUrl = getValidImage(trackInfo.track.album.image);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching track album info:', err);
                }
            }
            
            // Se ainda não tiver imagem, tenta buscar do artista
            if (!imageUrl) {
                try {
                    const artistInfoResponse = await fetch(
                        `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(track.artist.name)}&api_key=${API_KEYS.lastfm}&format=json`
                    );
                    
                    if (artistInfoResponse.ok) {
                        const artistInfo = await artistInfoResponse.json();
                        if (artistInfo.artist) {
                            imageUrl = getValidImage(artistInfo.artist.image);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching artist info for image:', err);
                }
            }
            
            // Se ainda não tiver imagem, usa a padrão específica para músicas
            if (!imageUrl) {
                imageUrl = DEFAULT_TRACK_IMAGE;
            }
            
            return {
                title: track.name,
                artist: track.artist.name,
                imageUrl: imageUrl
            };
        }));
        
        return formattedTracks;
    } catch (error) {
        console.error('Error fetching top songs:', error);
        // Return dummy data as fallback
        return Array.from({ length: 10 }, (_, i) => ({
            title: `Top Hit ${i + 1}`,
            artist: 'Popular Artist',
            imageUrl: DEFAULT_TRACK_IMAGE
        }));
    }
}

export async function fetchLyrics(song, artist) {
    try {
        // Using lyrics.ovh API (free, no key required)
        const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`);
        if (!response.ok) throw new Error('Lyrics not found');
        
        const data = await response.json();
        return data.lyrics;
    } catch (error) {
        console.error('Error fetching lyrics:', error);
        return `[Verse 1]\nLyrics could not be loaded for "${song}" by ${artist}.\nPlease try another song or check back later.\n\n[Note]\nThis could be due to:\n- Song not found in database\n- API rate limiting\n- Network connectivity issues`;
    }
}

export async function fetchYouTubeVideo(query) {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=AIzaSyBrYe7s3TgU0Cd05lRXu_H2mzCN1VuzFb4`);
        if (!response.ok) throw new Error('Failed to fetch video');
        const data = await response.json();
        return data.items[0]?.id?.videoId;
    } catch (error) {
        console.error('Error fetching YouTube video:', error);
        return null;
    }
}

export async function fetchArtistInfo(artistName) {
    try {
        const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${API_KEYS.lastfm}&format=json`);
        if (!response.ok) throw new Error('Failed to fetch artist info');
        
        const data = await response.json();
        const artist = data.artist;
        
        // Busca também as imagens dos álbuns
        const albumsResponse = await fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${encodeURIComponent(artistName)}&api_key=${API_KEYS.lastfm}&format=json&limit=6`);
        const albumsData = await albumsResponse.json();
        
        // Inicializa a URL da imagem do artista como null
        let artistImageUrl = null;
        
        // Tenta obter uma imagem válida do artista
        if (artist && artist.image) {
            artistImageUrl = getValidImage(artist.image);
        }
        
        // Se não encontrar uma imagem válida do artista, tenta usar a imagem do primeiro álbum
        if (!artistImageUrl && albumsData.topalbums && albumsData.topalbums.album && albumsData.topalbums.album.length > 0) {
            // Itera pelos álbuns até encontrar uma imagem válida
            for (let i = 0; i < Math.min(albumsData.topalbums.album.length, 3); i++) {
                const albumImage = getValidImage(albumsData.topalbums.album[i].image);
                if (albumImage) {
                    artistImageUrl = albumImage;
                    break;
                }
            }
        }
        
        // Se ainda não tiver imagem, verifica se há alguma imagem direta no album
        if (!artistImageUrl && albumsData.topalbums && albumsData.topalbums.album && albumsData.topalbums.album.length > 0) {
            for (let album of albumsData.topalbums.album) {
                if (album.image && album.image.length > 0 && album.image[album.image.length - 1]['#text']) {
                    const imgUrl = album.image[album.image.length - 1]['#text'];
                    if (imgUrl && imgUrl.length > 10 && !imgUrl.includes('2a96cbd8b46e442fc41c2b86b821562f')) {
                        artistImageUrl = imgUrl;
                        break;
                    }
                }
            }
        }
        
        // Se ainda estiver sem imagem, usa a alternativa
        if (!artistImageUrl) {
            artistImageUrl = DEFAULT_ARTIST_IMAGE;
        }
        
        // Verifica se há álbuns disponíveis
        const albums = [];
        if (albumsData.topalbums && albumsData.topalbums.album) {
            for (let album of albumsData.topalbums.album) {
                const albumImageUrl = getValidImage(album.image) || DEFAULT_ALBUM_IMAGE;
                albums.push({
                    name: album.name,
                    imageUrl: albumImageUrl
                });
            }
        }
        
        return {
            name: artist.name,
            bio: artist.bio?.summary || 'No biography available.',
            imageUrl: artistImageUrl,
            albums: albums
        };
    } catch (error) {
        console.error('Error fetching artist info:', error);
        return {
            name: artistName,
            bio: 'Artist information not available.',
            imageUrl: DEFAULT_ARTIST_IMAGE,
            albums: []
        };
    }
}

export async function translateText(text, targetLang = 'en') {
    try {
        // Using LibreTranslate API (free, no key required)
        const response = await fetch('https://libretranslate.de/translate', {
            method: 'POST',
            body: JSON.stringify({
                q: text,
                source: 'auto',
                target: targetLang
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Translation failed');
        
        const data = await response.json();
        return data.translatedText;
    } catch (error) {
        console.error('Error translating text:', error);
        return text;
    }
}

export async function searchSongs(query) {
    try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=${API_KEYS.lastfm}&format=json&limit=5`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.results || !data.results.trackmatches) {
            throw new Error('Nenhum resultado encontrado');
        }

        const tracks = data.results.trackmatches.track;
        
        const formattedTracks = await Promise.all(tracks.map(async (track) => {
            let imageUrl = getValidImage(track.image);
            
            // Se não conseguir a imagem da música, tenta obter do álbum
            if (!imageUrl) {
                try {
                    // Busca informações do álbum da música
                    const trackInfoResponse = await fetch(
                        `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${API_KEYS.lastfm}&artist=${encodeURIComponent(track.artist)}&track=${encodeURIComponent(track.name)}&format=json`
                    );
                    
                    if (trackInfoResponse.ok) {
                        const trackInfo = await trackInfoResponse.json();
                        if (trackInfo.track && trackInfo.track.album) {
                            imageUrl = getValidImage(trackInfo.track.album.image);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching track album info:', err);
                }
            }
            
            // Se ainda não tiver imagem, tenta buscar do artista
            if (!imageUrl) {
                try {
                    const artistInfoResponse = await fetch(
                        `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(track.artist)}&api_key=${API_KEYS.lastfm}&format=json`
                    );
                    
                    if (artistInfoResponse.ok) {
                        const artistInfo = await artistInfoResponse.json();
                        if (artistInfo.artist) {
                            imageUrl = getValidImage(artistInfo.artist.image);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching artist info for image:', err);
                }
            }
            
            // Se ainda não tiver imagem, usa a padrão específica para músicas
            if (!imageUrl) {
                imageUrl = DEFAULT_TRACK_IMAGE;
            }
            
            return {
                title: track.name,
                artist: track.artist,
                imageUrl: imageUrl
            };
        }));
        
        return formattedTracks;
    } catch (error) {
        console.error('Erro ao buscar músicas:', error);
        alert('Erro ao buscar músicas. Verifique sua conexão ou tente novamente mais tarde.');
        return [];
    }
}

export async function fetchRandomSongByGenre(genreId) {
    try {
        const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${genreId}&api_key=${API_KEYS.lastfm}&format=json&limit=50`);
        if (!response.ok) throw new Error('Failed to fetch genre tracks');
        
        const data = await response.json();
        const tracks = data.tracks.track;
        const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
        
        return {
            artist: randomTrack.artist.name,
            title: randomTrack.name
        };
    } catch (error) {
        console.error('Error loading random song:', error);
        throw new Error('Failed to load a random song. Please try again.');
    }
}