import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import albumCover from "../assets/album-cover.jpg";
import "./GramophonePlayer.css";

const GramophonePlayer = forwardRef(({ onPanelOpen }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [needsInteraction, setNeedsInteraction] = useState(true);
    const [musicNotes, setMusicNotes] = useState([]);
    const playerRef = useRef(null);
    const containerRef = useRef(null);

    // Default song - Can't Help Falling In Love by Elvis Presley
    // YouTube video ID for this song (full version)
    const DEFAULT_VIDEO_ID = "vGJTaP6anOU";

    const currentSong = {
        title: "Can't Help Falling In Love",
        artist: "Elvis Presley"
    };

    // Load YouTube IFrame API
    useEffect(() => {
        // Create YouTube API script if not already loaded
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScript = document.getElementsByTagName('script')[0];
            firstScript.parentNode.insertBefore(tag, firstScript);
        }

        // Initialize player when API is ready
        const initPlayer = () => {
            if (window.YT && window.YT.Player && containerRef.current) {
                playerRef.current = new window.YT.Player('youtube-player', {
                    height: '0',
                    width: '0',
                    videoId: DEFAULT_VIDEO_ID,
                    playerVars: {
                        'autoplay': 0, // Don't autoplay - wait for user interaction
                        'controls': 0,
                        'disablekb': 1,
                        'fs': 0,
                        'modestbranding': 1,
                        'rel': 0,
                        'showinfo': 0,
                        'loop': 1,
                        'playlist': DEFAULT_VIDEO_ID,
                    },
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange,
                        'onError': onPlayerError
                    }
                });
            }
        };

        // Check if API is already loaded
        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
            }
        };
    }, []);

    const onPlayerReady = (event) => {
        console.log("YouTube player ready");
        setIsReady(true);
        event.target.setVolume(70);
        // Auto-play when ready - try to start playing automatically
        try {
            event.target.playVideo();
            setNeedsInteraction(false);
        } catch (e) {
            // If autoplay fails (browser policy), wait for user click
            console.log("Autoplay blocked, waiting for user interaction");
            setNeedsInteraction(true);
        }
    };

    const onPlayerStateChange = (event) => {
        // YT.PlayerState: ENDED = 0, PLAYING = 1, PAUSED = 2, BUFFERING = 3
        if (event.data === 1) { // Playing
            setIsPlaying(true);
            setNeedsInteraction(false);
        } else if (event.data === 2 || event.data === 0) { // Paused or ended
            setIsPlaying(false);
        }
    };

    const onPlayerError = (event) => {
        console.error("YouTube player error:", event.data);
        setIsReady(false);
    };

    // Generate floating music notes when playing
    useEffect(() => {
        if (!isPlaying) {
            setMusicNotes([]);
            return;
        }

        const notes = ['♪', '♫', '♬', '♩', '🎵', '💕', '✨'];
        const interval = setInterval(() => {
            const newNote = {
                id: Date.now(),
                symbol: notes[Math.floor(Math.random() * notes.length)],
                left: 10 + Math.random() * 80,
                delay: Math.random() * 0.5,
                duration: 2 + Math.random() * 2
            };
            setMusicNotes(prev => [...prev.slice(-6), newNote]);
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        playVideo: (videoId) => {
            if (playerRef.current && playerRef.current.loadVideoById) {
                playerRef.current.loadVideoById(videoId);
            }
        },
        getCurrentSong: () => currentSong,
        isPlaying: () => isPlaying,
        togglePlayback: () => togglePlay(),
    }));

    const togglePlay = () => {
        if (!playerRef.current || !isReady) return;

        try {
            if (isPlaying) {
                playerRef.current.pauseVideo();
                setIsPlaying(false);
            } else {
                playerRef.current.playVideo();
                setIsPlaying(true);
                setNeedsInteraction(false);
            }
        } catch (e) {
            console.log("Toggle play error:", e);
        }
    };

    return (
        <div className="gramophone-mini" ref={containerRef}>
            {/* Hidden YouTube Player */}
            <div id="youtube-player" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}></div>

            {/* Floating Music Notes */}
            <div className="music-notes-container">
                {musicNotes.map(note => (
                    <span
                        key={note.id}
                        className="floating-note"
                        style={{
                            left: `${note.left}%`,
                            animationDelay: `${note.delay}s`,
                            animationDuration: `${note.duration}s`
                        }}
                    >
                        {note.symbol}
                    </span>
                ))}
            </div>

            {/* Glow Effect */}
            <div className={`vinyl-glow ${isPlaying ? 'playing' : ''}`}></div>

            {/* Vinyl Disk - Click to Play/Pause */}
            <div
                className={`vinyl-disk ${isPlaying ? 'spinning' : ''} ${!isReady ? 'loading' : ''}`}
                onClick={togglePlay}
                title={isPlaying ? "Click to pause" : "Click to play"}
            >
                {/* Vinyl Grooves */}
                <div className="disk-groove groove-1"></div>
                <div className="disk-groove groove-2"></div>
                <div className="disk-groove groove-3"></div>
                <div className="disk-groove groove-4"></div>

                {/* Album Cover Center Label */}
                <div className="disk-label">
                    <img
                        src={albumCover}
                        alt="Album Cover"
                        className="label-img"
                    />
                    <div className="label-overlay"></div>
                    <div className="label-center">
                        <div className="center-dot"></div>
                    </div>
                </div>

                {/* Vinyl Shine */}
                <div className="disk-shine"></div>

                {/* Play Indicator - Shows when needs interaction or paused */}
                {(needsInteraction || !isPlaying) && (
                    <div className="play-indicator visible">
                        {!isReady ? (
                            <div className="mini-spinner"></div>
                        ) : (
                            <span className="play-icon">▶</span>
                        )}
                    </div>
                )}

                {/* Pause Indicator - Shows on hover when playing */}
                {isPlaying && (
                    <div className="pause-indicator">
                        <span>⏸</span>
                    </div>
                )}
            </div>

            {/* Song Info Below Disk */}
            <div className="song-info-mini">
                <h4 className="song-title-mini">{currentSong.title}</h4>
                <p className="song-artist-mini">{currentSong.artist}</p>
                {needsInteraction && isReady && (
                    <p className="click-hint">Click to play</p>
                )}
            </div>
        </div>
    );
});

GramophonePlayer.displayName = 'GramophonePlayer';

export default GramophonePlayer;
