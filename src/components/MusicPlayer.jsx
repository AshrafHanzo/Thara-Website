import { useState, useRef, useEffect, useCallback } from "react";
import {
  Music, Heart, Search, X, Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Volume2, VolumeX, Volume1, Plus, Trash2,
  Headphones, Sparkles, ListMusic
} from "lucide-react";
import "./MusicPlayer.css";

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const audioRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Search songs using JioSaavn API
  const searchSongs = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&limit=15`
      );
      const data = await response.json();

      if (data.success && data.data?.results) {
        setSearchResults(data.data.results.map(track => ({
          id: track.id,
          title: track.name,
          artist: track.artists?.primary?.map(a => a.name).join(", ") || "Unknown Artist",
          album: track.album?.name || "",
          cover: track.image?.[2]?.url || track.image?.[1]?.url || "https://via.placeholder.com/150",
          preview: track.downloadUrl?.[4]?.url || track.downloadUrl?.[3]?.url || track.downloadUrl?.[2]?.url || null,
          duration: track.duration || 0,
        })));
      }
    } catch (error) {
      console.error("Error searching songs:", error);
      try {
        const response = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=15`
        );
        const data = await response.json();

        if (data.results) {
          setSearchResults(data.results.map(track => ({
            id: track.trackId,
            title: track.trackName,
            artist: track.artistName,
            album: track.collectionName || "",
            cover: track.artworkUrl100?.replace("100x100", "300x300") || "https://via.placeholder.com/150",
            preview: track.previewUrl,
            duration: Math.floor((track.trackTimeMillis || 0) / 1000),
          })));
        }
      } catch (e) {
        console.error("Fallback search failed:", e);
      }
    }
    setIsSearching(false);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchSongs(searchQuery), 500);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, searchSongs]);

  const playSong = (song, fromPlaylist = false) => {
    setCurrentSong(song);
    if (fromPlaylist) {
      const idx = playlist.findIndex(s => s.id === song.id);
      if (idx !== -1) setCurrentIndex(idx);
    }
    if (song.preview && audioRef.current) {
      audioRef.current.src = song.preview;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.log("Play failed:", e));
    }
  };

  const addToPlaylist = (song) => {
    if (!playlist.find(s => s.id === song.id)) {
      setPlaylist(prev => [...prev, song]);
    }
  };

  const removeFromPlaylist = (songId) => {
    setPlaylist(prev => prev.filter(s => s.id !== songId));
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.log("Play failed:", e));
    }
  };

  const nextSong = () => {
    if (playlist.length === 0) return;
    let nextIndex = shuffle ? Math.floor(Math.random() * playlist.length) : (currentIndex + 1) % playlist.length;
    playSong(playlist[nextIndex], true);
    setCurrentIndex(nextIndex);
  };

  const prevSong = () => {
    if (playlist.length === 0) return;
    let prevIndex = shuffle ? Math.floor(Math.random() * playlist.length) : (currentIndex - 1 + playlist.length) % playlist.length;
    playSong(playlist[prevIndex], true);
    setCurrentIndex(prevIndex);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      if (repeat) { audio.currentTime = 0; audio.play(); }
      else if (playlist.length > 0) nextSong();
    };
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);
    audio.volume = volume;
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentIndex, repeat, volume, shuffle, playlist]);

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const VolumeIcon = volume > 0.5 ? Volume2 : volume > 0 ? Volume1 : VolumeX;

  return (
    <>
      {/* Collapsible Toggle Button - Icon only, expands when panel opens */}
      <button
        className={`music-toggle ${isPlaying ? "playing" : ""} ${isPanelOpen ? "expanded" : "collapsed"}`}
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        aria-label={isPanelOpen ? "Close music player" : "Open music player"}
      >
        <span className="toggle-glow"></span>
        {isPlaying ? (
          <>
            <Music className="toggle-icon" size={20} />
            {isPanelOpen && <span className="toggle-text">Playing</span>}
            <span className="pulse-ring"></span>
          </>
        ) : (
          <>
            <Headphones className="toggle-icon" size={20} />
            {isPanelOpen && <span className="toggle-text">Playlist</span>}
          </>
        )}
      </button>

      {/* Stunning Music Panel */}
      <div className={`music-panel ${isPanelOpen ? "open" : ""}`}>
        {/* Premium Header */}
        <div className="music-header">
          <div className="header-glow"></div>
          <div className="music-logo">
            <div className="icon-wrapper">
              <Heart className="header-icon animated-heart" size={24} fill="#fff" />
              <span className="icon-sparkle"></span>
            </div>
            <div className="music-title">
              <span className="title-main">
                <span className="title-gradient">For My Love</span>
                <span className="title-heart">❤</span>
              </span>
              <span className="title-sub">
                <Sparkles size={12} className="sparkle-icon" /> Special songs for you
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsPanelOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search Tamil, English, Hindi songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery("")}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="music-tabs">
          <button
            className={`tab-btn ${activeTab === "search" ? "active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            <Search size={16} />
            <span>Search</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "playlist" ? "active" : ""}`}
            onClick={() => setActiveTab("playlist")}
          >
            <ListMusic size={16} />
            <span>My Playlist ({playlist.length})</span>
          </button>
        </div>

        {/* Song List */}
        <div className="song-list">
          {activeTab === "search" && (
            <>
              {isSearching && (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Searching songs for you...</p>
                </div>
              )}

              {!searchQuery && !isSearching && (
                <div className="empty-state">
                  <Music className="empty-icon-svg" size={48} />
                  <p>Search for your favorite songs</p>
                  <p className="empty-hint">Tamil • English • Hindi & more!</p>
                </div>
              )}

              {searchQuery && !isSearching && searchResults.length === 0 && (
                <div className="empty-state">
                  <Search className="empty-icon-svg" size={48} />
                  <p>No songs found</p>
                  <p className="empty-hint">Try a different search term</p>
                </div>
              )}

              {searchResults.map((song) => (
                <div
                  key={song.id}
                  className={`song-item ${currentSong?.id === song.id ? "active" : ""}`}
                >
                  <img src={song.cover} alt={song.title} className="song-cover" />
                  <div className="song-info" onClick={() => playSong(song)}>
                    <p className="song-title">{song.title}</p>
                    <p className="song-artist">{song.artist}</p>
                  </div>
                  <div className="song-actions">
                    <button className="action-btn add-btn" onClick={() => addToPlaylist(song)} title="Add to playlist">
                      <Plus size={16} />
                    </button>
                    <button className="action-btn play-btn-small" onClick={() => playSong(song)} title="Play now">
                      <Play size={16} fill="currentColor" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "playlist" && (
            <>
              {playlist.length === 0 && (
                <div className="empty-state">
                  <Heart className="empty-icon-svg" size={48} />
                  <p>Your playlist is empty</p>
                  <p className="empty-hint">Search and add songs you love!</p>
                </div>
              )}

              {playlist.map((song, index) => (
                <div
                  key={song.id}
                  className={`song-item ${currentSong?.id === song.id ? "active" : ""}`}
                  onClick={() => playSong(song, true)}
                >
                  <span className="song-number">
                    {currentSong?.id === song.id && isPlaying ? (
                      <div className="playing-indicator"><span></span><span></span><span></span></div>
                    ) : (index + 1)}
                  </span>
                  <img src={song.cover} alt={song.title} className="song-cover" />
                  <div className="song-info">
                    <p className="song-title">{song.title}</p>
                    <p className="song-artist">{song.artist}</p>
                  </div>
                  <button className="action-btn remove-btn" onClick={(e) => { e.stopPropagation(); removeFromPlaylist(song.id); }} title="Remove">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Now Playing Bar */}
        {currentSong && (
          <div className="now-playing">
            <div className="now-playing-info">
              <img src={currentSong.cover} alt={currentSong.title} className="now-playing-cover" />
              <div className="now-playing-text">
                <p className="now-playing-title">{currentSong.title}</p>
                <p className="now-playing-artist">{currentSong.artist}</p>
              </div>
            </div>

            <div className="playback-section">
              <div className="playback-controls">
                <button className={`control-btn ${shuffle ? "active" : ""}`} onClick={() => setShuffle(!shuffle)} title="Shuffle">
                  <Shuffle size={18} />
                </button>
                <button className="control-btn" onClick={prevSong} title="Previous">
                  <SkipBack size={20} fill="currentColor" />
                </button>
                <button className="control-btn play-main" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                </button>
                <button className="control-btn" onClick={nextSong} title="Next">
                  <SkipForward size={20} fill="currentColor" />
                </button>
                <button className={`control-btn ${repeat ? "active" : ""}`} onClick={() => setRepeat(!repeat)} title="Repeat">
                  <Repeat size={18} />
                </button>
              </div>

              <div className="progress-row">
                <div className="progress-container">
                  <span className="time">{formatTime(audioRef.current?.currentTime || 0)}</span>
                  <div className="progress-bar" onClick={handleProgressClick}>
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="time">{formatTime(duration)}</span>
                </div>
                <div className="volume-section">
                  <VolumeIcon size={16} className="volume-icon-svg" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      setVolume(newVolume);
                      if (audioRef.current) audioRef.current.volume = newVolume;
                    }}
                    className="volume-slider"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />
    </>
  );
};

export default MusicPlayer;
