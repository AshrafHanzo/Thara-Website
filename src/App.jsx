import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useRef, useState, useEffect, Suspense, lazy } from "react";
import "./App.css";
import "./animations.css";
import Countdown from "./components/Countdown";
import Hearts from "./components/Hearts";
import MusicPlayer from "./components/MusicPlayer";
import GramophonePlayer from "./components/GramophonePlayer";

// Lazy load heavy components for better performance - only loads when needed
const CelebrationPage = lazy(() => import("./components/CelebrationPage"));
const Effects = lazy(() => import("./components/Effects"));
const Gallery = lazy(() => import("./components/Gallery"));
const MessageCard = lazy(() => import("./components/MessageCard"));
const Scene3DBackground = lazy(() => import("./components/3d/Scene3DBackground"));

// Loading spinner component for lazy loaded pages
const PageLoader = () => (
    <div className="page-loader">
        <div className="loader-content">
            <div className="loader-spinner"></div>
            <p className="loader-text">✨ Loading Magic... ✨</p>
        </div>
    </div>
);

gsap.registerPlugin(ScrollToPlugin);

function App() {
    const [currentPage, setCurrentPage] = useState(1); // Start at 1 for Countdown page
    // Button will be disabled until countdown reaches birthday (January 23, 2026)
    const [birthdayReached, setBirthdayReached] = useState(() => {
        const birthday = new Date("2026-01-23T00:00:00");
        return new Date() >= birthday;
    });
    const [showEffects, setShowEffects] = useState(false);
    const [showMusicPanel, setShowMusicPanel] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const page1Ref = useRef(null); // Countdown page
    const page2Ref = useRef(null); // Celebration Page
    const page3Ref = useRef(null); // MessageCard
    const page4Ref = useRef(null); // Gallery
    const musicPlayerRef = useRef(null); // Music player control
    const gramophoneRef = useRef(null); // Gramophone player control

    const goToPage = (pageNumber) => {
        if (isTransitioning || pageNumber === currentPage) return;
        
        setIsTransitioning(true);
        const refs = { 1: page1Ref, 2: page2Ref, 3: page3Ref, 4: page4Ref };
        const currentPageRef = refs[currentPage];
        const isForward = pageNumber > currentPage;

        // First animate out current page
        if (currentPageRef?.current) {
            gsap.to(currentPageRef.current, {
                x: isForward ? "-100%" : "100%",
                opacity: 0,
                duration: 0.5,
                ease: "power2.inOut",
                onComplete: () => {
                    // Set page number - this will mount the new component
                    setCurrentPage(pageNumber);
                    gsap.to(window, { duration: 0.3, scrollTo: { y: 0 } });
                    
                    // Allow a brief moment for the new page to mount
                    setTimeout(() => {
                        const nextPageRef = refs[pageNumber];
                        if (nextPageRef?.current) {
                            // Set initial position
                            gsap.set(nextPageRef.current, {
                                x: isForward ? "100%" : "-100%",
                                opacity: 0,
                                visibility: "visible",
                            });
                            
                            // Animate in
                            gsap.to(nextPageRef.current, {
                                x: "0%",
                                opacity: 1,
                                duration: 0.5,
                                ease: "power2.out",
                                onComplete: () => {
                                    setIsTransitioning(false);
                                }
                            });
                        } else {
                            setIsTransitioning(false);
                        }
                    }, 100);
                },
            });
        } else {
            // No current page ref, just transition
            setCurrentPage(pageNumber);
            setIsTransitioning(false);
        }
    };

    const handleBirthdayReached = () => {
        setBirthdayReached(true);
        localStorage.setItem("birthdayReached", "true"); // Persist to localStorage
        setShowEffects(true);
        // Stop effects after some time
        setTimeout(() => setShowEffects(false), 10000);
    };

    const handleOpenMusicPanel = () => {
        setShowMusicPanel(true);
    };

    return (
        <div className="app">
            {/* Stunning 3D Background */}
            <Suspense fallback={null}>
                <Scene3DBackground />
            </Suspense>

            <MusicPlayer ref={musicPlayerRef} />
            <Hearts />

            {/* PAGE 1: Countdown Timer with Gramophone */}
            <div
                ref={page1Ref}
                className={`page ${currentPage === 1 ? "active" : ""}`}
                style={{ visibility: currentPage === 1 ? "visible" : "hidden" }}
            >
                {/* Hero Section with Gramophone */}
                <section className="hero-section">
                    <div className="hero-content">
                        <div className="hero-left">
                            <h1 className="hero-title stunning-title">
                                <span className="title-sparkle">✨</span>
                                <span className="title-word animate-word">Happy</span> <span className="title-word animate-word delay-1">20th</span> <span className="title-word animate-word delay-2">Birthday</span>
                                <span className="title-sparkle">✨</span>
                                <br />
                                <span className="highlight mega-glow">THARUMA</span> <span className="cake-emoji">🎂</span>
                            </h1>
                            <p className="hero-subtitle">
                                <span className="heart-left">💕</span>
                                <span className="subtitle-text">My Love, My Everything, My Forever</span>
                                <span className="heart-right">💕</span>
                            </p>
                        </div>

                        {/* Gramophone Player - Right Side */}
                        <div className="hero-right">
                            <GramophonePlayer
                                ref={gramophoneRef}
                                onPanelOpen={handleOpenMusicPanel}
                            />
                        </div>
                    </div>
                </section>

                {/* Countdown Section */}
                <section className="countdown-section">
                    <Countdown
                        onBirthdayReached={handleBirthdayReached}
                        birthdayReached={birthdayReached}
                    />
                </section>

                {/* Teaser Section */}
                <section className="teaser">
                    <h2 id="teaserHeading">
                        {birthdayReached
                            ? "💖 Ready for your surprise! 💖"
                            : "✨ A special celebration awaits you at midnight... ✨"}
                    </h2>
                    <p className="teaser-hint">Something magical is about to unfold 💫</p>
                </section>

                <button
                    id="surpriseBtn"
                    className="celebrate-btn stunning-btn"
                    disabled={!birthdayReached}
                    onClick={() => goToPage(2)}
                >
                    <span className="btn-sparkle-left">✨</span>
                    <span className="btn-content">
                        <span className="btn-emoji">🎉</span>
                        <span className="btn-text">Let's Celebrate</span>
                        <span className="btn-emoji">🎊</span>
                    </span>
                    <span className="btn-sparkle-right">✨</span>
                    <span className="btn-glow-effect"></span>
                    <span className="btn-shimmer"></span>
                </button>
            </div>

            {/* PAGE 2: Celebration/QNA Page - Only loads when needed */}
            {currentPage >= 2 && (
            <div
                ref={page2Ref}
                className={`page ${currentPage === 2 ? "active" : ""}`}
                style={{ visibility: currentPage === 2 ? "visible" : "hidden" }}
            >
                <Suspense fallback={<PageLoader />}>
                    <CelebrationPage
                        onComplete={() => goToPage(3)}
                        musicPlayerRef={musicPlayerRef}
                        onGoBack={() => goToPage(1)}
                    />
                </Suspense>
            </div>
            )}

            {/* PAGE 3: Message Card - Only loads when needed */}
            {currentPage >= 3 && (
            <div
                ref={page3Ref}
                className={`page ${currentPage === 3 ? "active" : ""}`}
                style={{ visibility: currentPage === 3 ? "visible" : "hidden" }}
            >
                <button className="back-btn" onClick={() => goToPage(2)}>
                    ← Back
                </button>
                <Suspense fallback={<PageLoader />}>
                    <MessageCard isActive={currentPage === 3} />
                </Suspense>
                <button className="page-nav-btn" onClick={() => goToPage(4)}>
                    📸 View Our Memories
                </button>
            </div>
            )}

            {/* PAGE 4: Gallery - Only loads when needed */}
            {currentPage >= 4 && (
            <div
                ref={page4Ref}
                className={`page ${currentPage === 4 ? "active" : ""}`}
                style={{ visibility: currentPage === 4 ? "visible" : "hidden" }}
            >
                <button className="back-btn" onClick={() => goToPage(3)}>
                    ← Back
                </button>
                <Suspense fallback={<PageLoader />}>
                    <Gallery isActive={currentPage === 4} />
                </Suspense>
                <section className="final">
                    <h2 className="final-message">💖 Forever Yours — [Your Name] 💖</h2>
                    <p className="final-subtitle">Your personalized closing message ✨</p>
                </section>
            </div>
            )}

            {/* Effects - Only loads when active */}
            {showEffects && (
                <Suspense fallback={null}>
                    <Effects />
                </Suspense>
            )}
        </div>
    );
}

export default App;
