import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useRef, useState, useEffect, Suspense, lazy } from "react";
import "./App.css";
import "./animations.css";
import CelebrationPage from "./components/CelebrationPage";
import Countdown from "./components/Countdown";
import Effects from "./components/Effects";
import Gallery from "./components/Gallery";
import Hearts from "./components/Hearts";
import MessageCard from "./components/MessageCard";
import MusicPlayer from "./components/MusicPlayer";
import GramophonePlayer from "./components/GramophonePlayer";

// Lazy load 3D scene for performance
const Scene3DBackground = lazy(() => import("./components/3d/Scene3DBackground"));

gsap.registerPlugin(ScrollToPlugin);

function App() {
    const [currentPage, setCurrentPage] = useState(1); // Start at 1 for Countdown page
    // Check localStorage to persist birthday reached state
    const [birthdayReached, setBirthdayReached] = useState(() => {
        const saved = localStorage.getItem("birthdayReached");
        return saved === "true";
    });
    const [showEffects, setShowEffects] = useState(false);
    const [showMusicPanel, setShowMusicPanel] = useState(false);

    const page1Ref = useRef(null); // Countdown page
    const page2Ref = useRef(null); // Celebration Page
    const page3Ref = useRef(null); // MessageCard
    const page4Ref = useRef(null); // Gallery
    const musicPlayerRef = useRef(null); // Music player control
    const gramophoneRef = useRef(null); // Gramophone player control

    const goToPage = (pageNumber) => {
        const refs = { 1: page1Ref, 2: page2Ref, 3: page3Ref, 4: page4Ref };
        const currentPageRef = refs[currentPage];
        const nextPageRef = refs[pageNumber];

        const isForward = pageNumber > currentPage;

        // Animate out current page
        gsap.to(currentPageRef.current, {
            x: isForward ? "-100%" : "100%",
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut",
        });

        // Prepare next page
        gsap.set(nextPageRef.current, {
            x: isForward ? "100%" : "-100%",
            opacity: 0,
            visibility: "visible",
        });

        // Animate in next page
        gsap.to(nextPageRef.current, {
            x: "0%",
            opacity: 1,
            duration: 0.6,
            ease: "power2.inOut",
            delay: 0.2,
            onComplete: () => {
                setCurrentPage(pageNumber);
                // Reset current page position
                gsap.set(currentPageRef.current, { x: "0%", visibility: "hidden" });

                // Smooth scroll to top
                gsap.to(window, { duration: 0.3, scrollTo: { y: 0 } });
            },
        });
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
                            <h1 className="hero-title">
                                <span className="title-word">Happy</span> <span className="title-word">21st</span> <span className="title-word">Birthday</span>
                                <br />
                                <span className="highlight">THARUMA</span> <span className="cake-emoji">🎂</span>
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
                    className="celebrate-btn"
                    disabled={!birthdayReached}
                    onClick={() => goToPage(2)}
                >
                    🎀 Let's Celebrate
                </button>
            </div>

            {/* PAGE 2: Celebration/QNA Page */}
            <div
                ref={page2Ref}
                className={`page ${currentPage === 2 ? "active" : ""}`}
                style={{ visibility: currentPage === 2 ? "visible" : "hidden" }}
            >
                <CelebrationPage
                    onComplete={() => goToPage(3)}
                    musicPlayerRef={musicPlayerRef}
                    onGoBack={() => goToPage(1)}
                />
            </div>

            {/* PAGE 3: Message Card */}
            <div
                ref={page3Ref}
                className={`page ${currentPage === 3 ? "active" : ""}`}
                style={{ visibility: currentPage === 3 ? "visible" : "hidden" }}
            >
                <button className="back-btn" onClick={() => goToPage(2)}>
                    ← Back
                </button>
                <MessageCard isActive={currentPage === 3} />
                <button className="page-nav-btn" onClick={() => goToPage(4)}>
                    📸 View Our Memories
                </button>
            </div>

            {/* PAGE 4: Gallery */}
            <div
                ref={page4Ref}
                className={`page ${currentPage === 4 ? "active" : ""}`}
                style={{ visibility: currentPage === 4 ? "visible" : "hidden" }}
            >
                <button className="back-btn" onClick={() => goToPage(3)}>
                    ← Back
                </button>
                <Gallery isActive={currentPage === 4} />
                <section className="final">
                    <h2 className="final-message">💖 Forever Yours — [Your Name] 💖</h2>
                    <p className="final-subtitle">Your personalized closing message ✨</p>
                </section>
            </div>

            {/* Effects */}
            {showEffects && <Effects />}
        </div>
    );
}

export default App;
