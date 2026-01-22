/**
 * Performance Context
 * Provides performance settings to all components
 */
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
    calculatePerformanceScore,
    getQuickPerformanceEstimate,
    getQualitySettings,
    QUALITY_LEVELS
} from '../utils/performanceDetector';

// Create context
const PerformanceContext = createContext(null);

// Provider component
export function PerformanceProvider({ children }) {
    const [performanceData, setPerformanceData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [manualQuality, setManualQuality] = useState(null);

    // Get initial quick estimate immediately
    useEffect(() => {
        // Quick estimate for immediate use
        const quickEstimate = getQuickPerformanceEstimate();
        const quickSettings = getQualitySettings(quickEstimate.quality);

        setPerformanceData({
            score: quickEstimate.score,
            quality: quickEstimate.quality,
            settings: quickSettings,
            isQuickEstimate: true
        });

        // Run full benchmark in background
        calculatePerformanceScore().then((result) => {
            const settings = getQualitySettings(result.quality);
            setPerformanceData({
                score: result.score,
                quality: result.quality,
                settings,
                details: result.details,
                isQuickEstimate: false
            });
            setIsLoading(false);

            // Log performance info (always show for debugging)
            console.log('🎮 Performance Detection:', {
                score: result.score,
                quality: result.quality,
                details: result.details
            });
        });
    }, []);

    // Apply manual quality override
    const currentData = useMemo(() => {
        if (!performanceData) return null;

        if (manualQuality) {
            return {
                ...performanceData,
                quality: manualQuality,
                settings: getQualitySettings(manualQuality),
                isManualOverride: true
            };
        }

        return performanceData;
    }, [performanceData, manualQuality]);

    // Function to manually set quality
    const setQuality = (quality) => {
        if (Object.values(QUALITY_LEVELS).includes(quality)) {
            setManualQuality(quality);
        }
    };

    // Reset to auto-detected quality
    const resetQuality = () => {
        setManualQuality(null);
    };

    const value = {
        // Current performance data
        ...currentData,
        isLoading,

        // Quality control functions
        setQuality,
        resetQuality,

        // Quality constants
        QUALITY_LEVELS
    };

    return (
        <PerformanceContext.Provider value={value}>
            {children}
        </PerformanceContext.Provider>
    );
}

// Hook to use performance context
export function usePerformance() {
    const context = useContext(PerformanceContext);

    if (!context) {
        // Return default high quality if not in provider
        return {
            score: 75,
            quality: QUALITY_LEVELS.HIGH,
            settings: getQualitySettings(QUALITY_LEVELS.HIGH),
            isLoading: false,
            setQuality: () => { },
            resetQuality: () => { },
            QUALITY_LEVELS
        };
    }

    return context;
}

// Hook to get specific setting
export function usePerformanceSetting(settingName) {
    const { settings } = usePerformance();
    return settings?.[settingName];
}

// Export quality levels for convenience
export { QUALITY_LEVELS };
