/**
 * Tamil Nadu District to Zone Mapping
 * Maps all 38 districts of Tamil Nadu to 4 zones: NORTH, SOUTH, EAST, WEST
 */

const DISTRICT_ZONE_MAP = {
    // NORTH ZONE - 11 districts (Chennai Metropolitan + Northern TN)
    'CHENNAI': 'NORTH',
    'TIRUVALLUR': 'NORTH',
    'KANCHIPURAM': 'NORTH',
    'CHENGALPATTU': 'NORTH',
    'VELLORE': 'NORTH',
    'RANIPET': 'NORTH',
    'TIRUPATHUR': 'NORTH',
    'KRISHNAGIRI': 'NORTH',
    'DHARMAPURI': 'NORTH',
    'TIRUVANNAMALAI': 'NORTH',
    'VILLUPURAM': 'NORTH',

    // SOUTH ZONE - 10 districts (Southern TN)
    'MADURAI': 'SOUTH',
    'THENI': 'SOUTH',
    'DINDIGUL': 'SOUTH',
    'VIRUDHUNAGAR': 'SOUTH',
    'SIVAGANGA': 'SOUTH',
    'RAMANATHAPURAM': 'SOUTH',
    'THOOTHUKUDI': 'SOUTH',
    'TIRUNELVELI': 'SOUTH',
    'TENKASI': 'SOUTH',
    'KANYAKUMARI': 'SOUTH',

    // EAST ZONE - 9 districts (Eastern TN + Cauvery Delta)
    'TIRUCHIRAPPALLI': 'EAST',
    'KARUR': 'EAST',
    'PERAMBALUR': 'EAST',
    'ARIYALUR': 'EAST',
    'CUDDALORE': 'EAST',
    'KALLAKURICHI': 'EAST',
    'THANJAVUR': 'EAST',
    'TIRUVARUR': 'EAST',
    'NAGAPATTINAM': 'EAST',
    'MAYILADUTHURAI': 'EAST',
    'PUDUKKOTTAI': 'EAST',

    // WEST ZONE - 8 districts (Western TN + Kongu Nadu)
    'COIMBATORE': 'WEST',
    'TIRUPPUR': 'WEST',
    'ERODE': 'WEST',
    'SALEM': 'WEST',
    'NAMAKKAL': 'WEST',
    'THE NILGIRIS': 'WEST',
    'NILGIRIS': 'WEST', // Alternative spelling
    'KARUR': 'WEST'
};

/**
 * Get zone from Tamil Nadu district name
 * @param {string} districtName - District name (case-insensitive)
 * @returns {string|null} Zone name (NORTH/SOUTH/EAST/WEST) or null if invalid
 */
export function getZoneFromDistrict(districtName) {
    if (!districtName) return null;

    const normalizedDistrict = districtName.trim().toUpperCase();
    return DISTRICT_ZONE_MAP[normalizedDistrict] || null;
}

/**
 * Get all districts in a specific zone
 * @param {string} zone - Zone name (NORTH/SOUTH/EAST/WEST)
 * @returns {string[]} Array of district names
 */
export function getDistrictsByZone(zone) {
    if (!zone) return [];

    const normalizedZone = zone.toUpperCase();
    return Object.entries(DISTRICT_ZONE_MAP)
        .filter(([_, zoneValue]) => zoneValue === normalizedZone)
        .map(([district, _]) => district);
}

/**
 * Check if a district is a valid Tamil Nadu district
 * @param {string} districtName - District name
 * @returns {boolean} True if valid TN district
 */
export function isValidTamilNaduDistrict(districtName) {
    if (!districtName) return false;

    const normalizedDistrict = districtName.trim().toUpperCase();
    return normalizedDistrict in DISTRICT_ZONE_MAP;
}

/**
 * Get all Tamil Nadu districts
 * @returns {string[]} Array of all district names
 */
export function getAllDistricts() {
    return Object.keys(DISTRICT_ZONE_MAP);
}

/**
 * Get district count by zone
 * @returns {Object} Object with zone counts
 */
export function getZoneDistrictCounts() {
    const counts = { NORTH: 0, SOUTH: 0, EAST: 0, WEST: 0 };

    Object.values(DISTRICT_ZONE_MAP).forEach(zone => {
        counts[zone]++;
    });

    return counts;
}
