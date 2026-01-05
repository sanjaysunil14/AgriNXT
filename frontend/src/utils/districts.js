/**
 * Tamil Nadu Districts List
 * Exports all 38 districts for use in dropdowns and forms
 */

export const TAMIL_NADU_DISTRICTS = [
    // NORTH ZONE
    'Chennai',
    'Tiruvallur',
    'Kanchipuram',
    'Chengalpattu',
    'Vellore',
    'Ranipet',
    'Tirupathur',
    'Krishnagiri',
    'Dharmapuri',
    'Tiruvannamalai',
    'Villupuram',

    // SOUTH ZONE
    'Madurai',
    'Theni',
    'Dindigul',
    'Virudhunagar',
    'Sivaganga',
    'Ramanathapuram',
    'Thoothukudi',
    'Tirunelveli',
    'Tenkasi',
    'Kanyakumari',

    // EAST ZONE
    'Tiruchirappalli',
    'Karur',
    'Perambalur',
    'Ariyalur',
    'Cuddalore',
    'Kallakurichi',
    'Thanjavur',
    'Tiruvarur',
    'Nagapattinam',
    'Mayiladuthurai',
    'Pudukkottai',

    // WEST ZONE
    'Coimbatore',
    'Tiruppur',
    'Erode',
    'Salem',
    'Namakkal',
    'The Nilgiris'
].sort(); // Alphabetically sorted for easier selection

// Export as TN_DISTRICTS for compatibility
export const TN_DISTRICTS = TAMIL_NADU_DISTRICTS;

// District to Zone mapping
const DISTRICT_ZONE_MAP = {
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
    'COIMBATORE': 'WEST',
    'TIRUPPUR': 'WEST',
    'ERODE': 'WEST',
    'SALEM': 'WEST',
    'NAMAKKAL': 'WEST',
    'THE NILGIRIS': 'WEST',
    'NILGIRIS': 'WEST'
};

/**
 * Get zone from district name
 * @param {string} districtName - District name
 * @returns {string|null} Zone name (NORTH/SOUTH/EAST/WEST) or null
 */
export function getZoneFromDistrict(districtName) {
    if (!districtName) return null;
    const normalized = districtName.trim().toUpperCase();
    return DISTRICT_ZONE_MAP[normalized] || null;
}

/**
 * Get zone badge color classes
 * @param {string} zone - Zone name
 * @returns {string} Tailwind CSS classes for zone badge
 */
export function getZoneBadgeColor(zone) {
    const colors = {
        'NORTH': 'bg-blue-100 text-blue-700 border-blue-300',
        'SOUTH': 'bg-red-100 text-red-700 border-red-300',
        'EAST': 'bg-green-100 text-green-700 border-green-300',
        'WEST': 'bg-purple-100 text-purple-700 border-purple-300'
    };
    return colors[zone] || 'bg-gray-100 text-gray-700 border-gray-300';
}

/**
 * Get all districts as options for select dropdown
 * @returns {Array} Array of {value, label} objects
 */
export function getDistrictOptions() {
    return TAMIL_NADU_DISTRICTS.map(district => ({
        value: district.toUpperCase(),
        label: district
    }));
}

/**
 * Validate if a district name is valid
 * @param {string} district - District name to validate
 * @returns {boolean} True if valid Tamil Nadu district
 */
export function isValidDistrict(district) {
    if (!district) return false;
    const normalized = district.trim().toUpperCase();
    return TAMIL_NADU_DISTRICTS.some(d => d.toUpperCase() === normalized);
}
