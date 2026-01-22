/**
 * WebGL-based Hardware Performance Detector
 * Calculates device performance score and returns quality level
 */

// Quality levels
export const QUALITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

// Get WebGL context and renderer info
function getWebGLInfo() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        return { supported: false, renderer: 'none', vendor: 'none', maxTextureSize: 0 };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER);
    const vendor = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : gl.getParameter(gl.VENDOR);
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    const maxTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

    return {
        supported: true,
        renderer,
        vendor,
        maxTextureSize,
        maxVertexAttribs,
        maxTextureUnits
    };
}

// Detect if device is mobile
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.innerWidth <= 768);
}

// GPU tier detection based on renderer name
function getGPUTier(renderer) {
    const rendererLower = renderer.toLowerCase();

    // High-end GPUs
    const highEndGPUs = [
        'nvidia geforce rtx', 'nvidia geforce gtx 10', 'nvidia geforce gtx 16',
        'nvidia geforce gtx 20', 'nvidia geforce gtx 30', 'nvidia geforce gtx 40',
        'radeon rx 5', 'radeon rx 6', 'radeon rx 7',
        'apple m1', 'apple m2', 'apple m3',
        'intel iris xe', 'intel arc'
    ];

    // Medium GPUs
    const mediumGPUs = [
        'nvidia geforce gtx 9', 'nvidia geforce gtx 7', 'nvidia geforce gtx 8',
        'radeon rx 4', 'radeon r9', 'radeon rx vega',
        'intel iris', 'intel uhd 6', 'intel uhd 7',
        'adreno 6', 'adreno 7', 'mali-g7', 'mali-g8'
    ];

    for (const gpu of highEndGPUs) {
        if (rendererLower.includes(gpu)) return 3;
    }

    for (const gpu of mediumGPUs) {
        if (rendererLower.includes(gpu)) return 2;
    }

    return 1; // Low-end or unknown
}

// Quick FPS benchmark (non-blocking)
function runFPSBenchmark() {
    return new Promise((resolve) => {
        let frameCount = 0;
        let startTime = performance.now();
        const duration = 200; // 200ms benchmark

        function countFrame() {
            frameCount++;
            if (performance.now() - startTime < duration) {
                requestAnimationFrame(countFrame);
            } else {
                const fps = Math.round((frameCount / duration) * 1000);
                resolve(fps);
            }
        }

        requestAnimationFrame(countFrame);
    });
}

// Calculate performance score (0-100)
export async function calculatePerformanceScore() {
    const webglInfo = getWebGLInfo();
    const isMobile = isMobileDevice();
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 3);

    // Base scores
    let score = 50; // Start at middle

    // WebGL support check
    if (!webglInfo.supported) {
        return { score: 10, quality: QUALITY_LEVELS.LOW, details: { webgl: false } };
    }

    // GPU tier (0-30 points)
    const gpuTier = getGPUTier(webglInfo.renderer);
    score += (gpuTier - 1) * 15; // 0, 15, or 30 points

    // Texture size (0-15 points)
    if (webglInfo.maxTextureSize >= 16384) score += 15;
    else if (webglInfo.maxTextureSize >= 8192) score += 10;
    else if (webglInfo.maxTextureSize >= 4096) score += 5;

    // Device pixel ratio (0-10 points)
    if (devicePixelRatio >= 2) score += 10;
    else if (devicePixelRatio >= 1.5) score += 5;

    // Mobile penalty (-15 points)
    if (isMobile) score -= 15;

    // Run FPS benchmark
    const fps = await runFPSBenchmark();

    // FPS adjustment (-20 to +10)
    if (fps >= 55) score += 10;
    else if (fps >= 45) score += 0;
    else if (fps >= 30) score -= 10;
    else score -= 20;

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Determine quality level
    let quality;
    if (score <= 30) quality = QUALITY_LEVELS.LOW;
    else if (score <= 60) quality = QUALITY_LEVELS.MEDIUM;
    else quality = QUALITY_LEVELS.HIGH;

    return {
        score,
        quality,
        details: {
            webgl: true,
            renderer: webglInfo.renderer,
            vendor: webglInfo.vendor,
            maxTextureSize: webglInfo.maxTextureSize,
            gpuTier,
            isMobile,
            devicePixelRatio,
            benchmarkFPS: fps
        }
    };
}

// Quick sync check (no benchmark, instant result)
export function getQuickPerformanceEstimate() {
    const webglInfo = getWebGLInfo();
    const isMobile = isMobileDevice();

    if (!webglInfo.supported) {
        return { quality: QUALITY_LEVELS.LOW, score: 10 };
    }

    const gpuTier = getGPUTier(webglInfo.renderer);

    if (isMobile && gpuTier === 1) {
        return { quality: QUALITY_LEVELS.LOW, score: 25 };
    }

    if (isMobile || gpuTier <= 1) {
        return { quality: QUALITY_LEVELS.MEDIUM, score: 45 };
    }

    if (gpuTier >= 3) {
        return { quality: QUALITY_LEVELS.HIGH, score: 80 };
    }

    return { quality: QUALITY_LEVELS.MEDIUM, score: 55 };
}

// Get recommended settings based on quality
export function getQualitySettings(quality) {
    switch (quality) {
        case QUALITY_LEVELS.LOW:
            return {
                // 3D Scene
                enable3D: false,
                particleCount: 30,
                enableBloom: false,
                enablePostProcessing: false,
                starCount: 200,
                heartCount: 0,
                enableSparkles: false,

                // Animations
                fireworkParticles: 15,
                confettiCount: 20,
                enableSmokeTrails: false,
                animationComplexity: 'simple',

                // Performance
                targetFPS: 30,
                pixelRatio: 1
            };

        case QUALITY_LEVELS.MEDIUM:
            return {
                // 3D Scene
                enable3D: true,
                particleCount: 100,
                enableBloom: false,
                enablePostProcessing: true,
                starCount: 800,
                heartCount: 3,
                enableSparkles: true,

                // Animations
                fireworkParticles: 25,
                confettiCount: 40,
                enableSmokeTrails: true,
                animationComplexity: 'medium',

                // Performance
                targetFPS: 45,
                pixelRatio: Math.min(window.devicePixelRatio, 1.5)
            };

        case QUALITY_LEVELS.HIGH:
        default:
            return {
                // 3D Scene
                enable3D: true,
                particleCount: 200,
                enableBloom: true,
                enablePostProcessing: true,
                starCount: 1500,
                heartCount: 7,
                enableSparkles: true,

                // Animations
                fireworkParticles: 40,
                confettiCount: 80,
                enableSmokeTrails: true,
                animationComplexity: 'full',

                // Performance
                targetFPS: 60,
                pixelRatio: Math.min(window.devicePixelRatio, 2)
            };
    }
}
