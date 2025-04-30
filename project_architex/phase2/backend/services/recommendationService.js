// backend/services/recommendationService.js
const Style = require('../models/Style');
const User = require('../models/User');

/**
 * Parse time period strings to extract start and end century/year
 * @param {String} periodStr - Period string (e.g., "15th-17th Century" or "1920s-1930s")
 * @returns {Object} - Object with start and end periods
 */
const parseTimePeriod = (periodStr) => {
    // Handle century format (e.g., "15th-17th Century")
    const centuryMatch = periodStr.match(/(\d+)(?:st|nd|rd|th)-(\d+)(?:st|nd|rd|th)/);
    if (centuryMatch) {
        return {
            start: parseInt(centuryMatch[1]),
            end: parseInt(centuryMatch[2])
        };
    }

    // Handle year format (e.g., "1920s-1930s" or "1920-1930")
    const yearMatch = periodStr.match(/(\d{4})s?-(\d{4})s?/);
    if (yearMatch) {
        // Convert to century for consistency
        return {
            start: Math.ceil(parseInt(yearMatch[1]) / 100),
            end: Math.ceil(parseInt(yearMatch[2]) / 100)
        };
    }

    // Handle single century/decade (e.g., "19th Century" or "1920s")
    const singleCenturyMatch = periodStr.match(/(\d+)(?:st|nd|rd|th)/);
    if (singleCenturyMatch) {
        const century = parseInt(singleCenturyMatch[1]);
        return { start: century, end: century };
    }

    const singleDecadeMatch = periodStr.match(/(\d{4})s/);
    if (singleDecadeMatch) {
        const century = Math.ceil(parseInt(singleDecadeMatch[1]) / 100);
        return { start: century, end: century };
    }

    // Default if no pattern matches
    return { start: 0, end: 0 };
};

/**
 * Calculate time period overlap between two periods
 * @param {Object} period1 - First period with start and end
 * @param {Object} period2 - Second period with start and end
 * @returns {Number} - Overlap score (0-1)
 */
const calculatePeriodOverlap = (period1, period2) => {
    // No valid periods to compare
    if (period1.start === 0 || period2.start === 0) {
        return 0;
    }

    // Check for overlap
    const hasOverlap =
        (period1.start <= period2.end && period1.end >= period2.start);

    if (!hasOverlap) {
        // Calculate how close the periods are
        const gap = Math.min(
            Math.abs(period1.end - period2.start),
            Math.abs(period2.end - period1.start)
        );
        // Return a small score for close periods
        return Math.max(0, 1 - (gap * 0.2));
    }

    // Calculate overlap amount
    const overlapStart = Math.max(period1.start, period2.start);
    const overlapEnd = Math.min(period1.end, period2.end);
    const overlapLength = overlapEnd - overlapStart + 1;

    // Calculate total range of both periods
    const period1Length = period1.end - period1.start + 1;
    const period2Length = period2.end - period2.start + 1;

    // Return ratio of overlap to average period length
    return overlapLength / ((period1Length + period2Length) / 2);
};

/**
 * Get top N recommended styles based on user's favorites time periods
 * @param {String} userId - The user ID
 * @param {Number} limit - Maximum number of recommendations to return
 * @param {Array<String>} excludeIds - Style IDs to exclude from recommendations
 * @returns {Promise<Array>} - Array of recommended styles
 */
exports.getTimeBasedRecommendations = async (userId, limit = 3, excludeIds = []) => {
    try {
        // Get user with populated favorites
        const user = await User.findById(userId).populate('favorites');

        if (!user || !user.favorites.length) {
            return [];
        }

        // Get IDs of user's favorited styles plus any excluded IDs
        const favoriteIds = user.favorites.map(style => style._id.toString());
        const allExcludedIds = [...favoriteIds, ...excludeIds];

        // Find all styles that are not in excluded list
        const allOtherStyles = await Style.find({
            _id: { $nin: allExcludedIds }
        });

        if (allOtherStyles.length === 0) {
            return [];
        }

        // Calculate time period overlap scores
        const scoredStyles = allOtherStyles.map(style => {
            let totalScore = 0;
            const stylePeriod = parseTimePeriod(style.period);

            // Compare with each favorite style
            user.favorites.forEach(favoriteStyle => {
                const favoritePeriod = parseTimePeriod(favoriteStyle.period);
                const periodOverlap = calculatePeriodOverlap(stylePeriod, favoritePeriod);

                // Add period overlap score
                totalScore += periodOverlap * 3; // Weight period overlap highly

                // Add smaller score for shared characteristics
                const commonCharacteristics = favoriteStyle.characteristics.filter(
                    char => style.characteristics.includes(char)
                ).length;

                totalScore += commonCharacteristics * 0.5;
            });

            // Average the score based on number of favorites
            const averageScore = totalScore / user.favorites.length;

            return {
                style,
                score: averageScore
            };
        });

        // Sort by score and get top recommendations
        const recommendations = scoredStyles
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.style);

        return recommendations;
    } catch (error) {
        console.error('Error getting time-based recommendations:', error);
        throw error;
    }
};

/**
 * Get a single recommendation to replace one that was favorited
 * @param {String} userId - The user ID
 * @param {Array<String>} currentRecommendationIds - IDs of current recommendations
 * @returns {Promise<Object|null>} - A new recommendation or null if none available
 */
exports.getReplacementRecommendation = async (userId, currentRecommendationIds) => {
    try {
        // Get a new recommendation, excluding current ones
        const recommendations = await this.getTimeBasedRecommendations(
            userId,
            1,
            currentRecommendationIds
        );

        return recommendations.length > 0 ? recommendations[0] : null;
    } catch (error) {
        console.error('Error getting replacement recommendation:', error);
        throw error;
    }
};