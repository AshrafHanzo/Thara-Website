import { useState } from "react";
import "./Gallery.css";

const Gallery = ({ onGoBack }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Media items - add your photos/videos here
  // Format: { type: 'image' | 'video', src: 'path/to/file', caption: 'optional caption' }
  const mediaItems = [
    // Example items - replace with actual media
    // { type: 'image', src: '/path/to/photo1.jpg', caption: 'Our first date 💛' },
    // { type: 'video', src: '/path/to/video1.mp4', caption: 'Special moment' },
  ];

  // Create placeholder slots if we have fewer than 6 items
  const totalSlots = Math.max(6, mediaItems.length);
  const placeholderCount = totalSlots - mediaItems.length;

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const prevItem = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  return (
    <div className="gallery-page">
      {/* Back button */}
      {onGoBack && (
        <button className="back-btn" onClick={onGoBack}>
          ← Back
        </button>
      )}

      {/* Header */}
      <div className="gallery-header">
        <h1 className="gallery-title">📸 Our Beautiful Memories 📸</h1>
        <p className="gallery-subtitle">💛 Moments we'll cherish forever 💛</p>
      </div>

      {/* Gallery Grid */}
      <div className="gallery-grid">
        {/* Render actual media items */}
        {mediaItems.map((item, index) => (
          <div
            key={index}
            className="gallery-item"
            onClick={() => openLightbox(index)}
          >
            {item.type === "image" ? (
              <img src={item.src} alt={item.caption || `Memory ${index + 1}`} />
            ) : (
              <>
                <video src={item.src} muted />
                <div className="video-indicator">▶️</div>
              </>
            )}
          </div>
        ))}

        {/* Render placeholder slots */}
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <div key={`placeholder-${index}`} className="gallery-placeholder">
            <span className="placeholder-icon">
              {index % 2 === 0 ? "📷" : "🎬"}
            </span>
            <p className="placeholder-text">
              {index === 0
                ? "Add your favorite photo here! 💛"
                : index === 1
                  ? "A special video moment..."
                  : "More memories coming soon ✨"}
            </p>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {mediaItems.length > 0 && (
        <div className={`lightbox ${lightboxOpen ? "open" : ""}`} onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            ✕
          </button>

          {mediaItems.length > 1 && (
            <>
              <button
                className="lightbox-nav lightbox-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  prevItem();
                }}
              >
                ←
              </button>
              <button
                className="lightbox-nav lightbox-next"
                onClick={(e) => {
                  e.stopPropagation();
                  nextItem();
                }}
              >
                →
              </button>
            </>
          )}

          {mediaItems[currentIndex] && (
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              {mediaItems[currentIndex].type === "image" ? (
                <img
                  src={mediaItems[currentIndex].src}
                  alt={mediaItems[currentIndex].caption || "Memory"}
                />
              ) : (
                <video
                  src={mediaItems[currentIndex].src}
                  controls
                  autoPlay
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Gallery;
