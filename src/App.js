import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import LyricsPage from './components/LyricsPage';
import Footer from './components/Footer';
import Banner from './components/Banner/index'

import { 
  fetchTopSongs, 
  fetchLyrics, 
  fetchYouTubeVideo, 
  fetchArtistInfo, 
  translateText,
  searchSongs,
  fetchRandomSongByGenre
} from './api';

function App() {
  // State
  const [currentPage, setCurrentPage] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [topSongs, setTopSongs] = useState([]);
  const [lyrics, setLyrics] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [artistInfo, setArtistInfo] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  // Initialize app
  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    }
    
    // Load top songs
    const loadTopSongs = async () => {
      const songs = await fetchTopSongs();
      setTopSongs(songs);
    };
    
    loadTopSongs();
    
    // Update top songs periodically
    const interval = setInterval(async () => {
      const newTopSongs = await fetchTopSongs();
      setTopSongs(newTopSongs);
    }, 300000); // Update every 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      document.body.classList.toggle('dark-mode', newMode);
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  // Navigation
  const navigateToHome = () => {
    setCurrentPage('home');
    setSearchResults(null);
  };

  const navigateToLyrics = async (query) => {
    setCurrentPage('lyrics');
    await loadSongDetails(query);
  };

  // Load song details
  const loadSongDetails = async (query) => {
    setCurrentSong(query);
    setLyrics('Loading lyrics...');
    setVideoId(null);
    setArtistInfo(null);
    
    const [artist, song] = query.split(' - ');
    
    // Load all data in parallel
    try {
      const [lyricsData, videoIdData, artistInfoData] = await Promise.all([
        fetchLyrics(song, artist),
        fetchYouTubeVideo(`${artist} ${song} official video`),
        fetchArtistInfo(artist)
      ]);
      
      setLyrics(lyricsData);
      setVideoId(videoIdData);
      setArtistInfo(artistInfoData);
    } catch (error) {
      console.error('Error loading song details:', error);
    }
  };

  // Translate lyrics
  const translateLyrics = async () => {
    try {
      const translatedLyrics = await translateText(lyrics);
      setLyrics(translatedLyrics);
    } catch (error) {
      console.error('Error translating lyrics:', error);
    }
  };

  // Handle search
  const handleSearch = async (query) => {
    try {
      const results = await searchSongs(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching songs:', error);
      setSearchResults([]);
    }
  };

  // Load random song by genre
  const handleRandomSongByGenre = async (genreId) => {
    try {
      const randomSong = await fetchRandomSongByGenre(genreId);
      navigateToLyrics(`${randomSong.artist} - ${randomSong.title}`);
    } catch (error) {
      console.error('Error loading random song:', error);
      alert('Failed to load a random song. Please try again.');
    }
  };

  return (
    <>
      <Header 
        currentPage={currentPage}
        navigateToHome={navigateToHome}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        handleSearch={handleSearch}
      />
      <Banner image="home"/>
      <main>
        {currentPage === 'home' ? (
          
        

          <HomePage 
            topSongs={topSongs}
            navigateToLyrics={navigateToLyrics}
            loadRandomSongByGenre={handleRandomSongByGenre}
            searchResults={searchResults}
           
          />
        ) : (
          <LyricsPage 
            currentSong={currentSong}
            lyrics={lyrics}
            artistInfo={artistInfo}
            videoId={videoId}
            translateLyrics={translateLyrics}
          />
        )}
         
        <Footer />
      </main>
    </>
  );
}

export default App;