import React, { useState, useRef } from 'react';
import { Music, Search, Sun, Moon, ChevronLeft } from 'lucide-react';

function Header({ 
  currentPage, 
  navigateToHome, 
  isDarkMode, 
  toggleTheme, 
  handleSearch 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
      setSearchQuery('');
    }
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo-section">
          {currentPage === 'lyrics' && (
            <button 
              className="back-button" 
              onClick={navigateToHome}
            >
              <ChevronLeft size={32} />
            </button>
          )}
          <div className="logo" onClick={navigateToHome}>
            <Music size={40} />
            <span>CycloneLyrics</span>
          </div>
        </div>

        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-container">
            <Search className="search-icon" size={24} />
            <input
              type="text"
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for songs or artists..."
            />
          </div>
        </form>

        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? (
            <Moon size={32} />
          ) : (
            <Sun size={32} />
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;