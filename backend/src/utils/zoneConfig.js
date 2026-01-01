/**
 * Zone Configuration for Tamil Nadu
 * Defines hub locations and metadata for each zone
 */

export const ZONE_HUBS = {
    NORTH: {
        name: 'Chennai Hub',
        city: 'Chennai',
        latitude: 13.0827,
        longitude: 80.2707,
        districts: 11
    },
    SOUTH: {
        name: 'Madurai Hub',
        city: 'Madurai',
        latitude: 9.9252,
        longitude: 78.1198,
        districts: 10
    },
    EAST: {
        name: 'Tiruchirappalli Hub',
        city: 'Tiruchirappalli',
        latitude: 10.7905,
        longitude: 78.7047,
        districts: 11
    },
    WEST: {
        name: 'Coimbatore Hub',
        city: 'Coimbatore',
        latitude: 11.0168,
        longitude: 76.9558,
        districts: 8
    }
};

/**
 * Get hub location for a specific zone
 * @param {string} zone - Zone name (NORTH/SOUTH/EAST/WEST)
 * @returns {Object|null} Hub location object or null
 */
export function getZoneHub(zone) {
    if (!zone) return null;
    return ZONE_HUBS[zone.toUpperCase()] || null;
}

/**
 * Get all zone names
 * @returns {string[]} Array of zone names
 */
export function getAllZones() {
    return Object.keys(ZONE_HUBS);
}

/**
 * Check if a zone is valid
 * @param {string} zone - Zone name
 * @returns {boolean} True if valid zone
 */
export function isValidZone(zone) {
    if (!zone) return false;
    return zone.toUpperCase() in ZONE_HUBS;
}
