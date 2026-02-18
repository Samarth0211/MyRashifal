// Database of major Indian cities with coordinates and timezone offsets
// tzOffset is in minutes from UTC (IST = +330 = 5h30m)

const CITIES = [
  // Metro cities
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, tzOffset: 330 },
  { name: 'Delhi', state: 'Delhi', lat: 28.6139, lon: 77.2090, tzOffset: 330 },
  { name: 'New Delhi', state: 'Delhi', lat: 28.6139, lon: 77.2090, tzOffset: 330 },
  { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lon: 77.5946, tzOffset: 330 },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, tzOffset: 330 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, tzOffset: 330 },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, tzOffset: 330 },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, tzOffset: 330 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, tzOffset: 330 },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, tzOffset: 330 },

  // Major cities
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, tzOffset: 330 },
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, tzOffset: 330 },
  { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319, tzOffset: 330 },
  { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882, tzOffset: 330 },
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577, tzOffset: 330 },
  { name: 'Thane', state: 'Maharashtra', lat: 19.2183, lon: 72.9781, tzOffset: 330 },
  { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126, tzOffset: 330 },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185, tzOffset: 330 },
  { name: 'Pimpri-Chinchwad', state: 'Maharashtra', lat: 18.6298, lon: 73.7997, tzOffset: 330 },
  { name: 'Patna', state: 'Bihar', lat: 25.6093, lon: 85.1376, tzOffset: 330 },
  { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lon: 73.1812, tzOffset: 330 },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lon: 77.4538, tzOffset: 330 },
  { name: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573, tzOffset: 330 },
  { name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lon: 78.0081, tzOffset: 330 },
  { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898, tzOffset: 330 },
  { name: 'Faridabad', state: 'Haryana', lat: 28.4089, lon: 77.3178, tzOffset: 330 },
  { name: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lon: 77.7064, tzOffset: 330 },
  { name: 'Rajkot', state: 'Gujarat', lat: 22.3039, lon: 70.8022, tzOffset: 330 },
  { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739, tzOffset: 330 },
  { name: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.0837, lon: 74.7973, tzOffset: 330 },
  { name: 'Aurangabad', state: 'Maharashtra', lat: 19.8762, lon: 75.3433, tzOffset: 330 },
  { name: 'Dhanbad', state: 'Jharkhand', lat: 23.7957, lon: 86.4304, tzOffset: 330 },
  { name: 'Amritsar', state: 'Punjab', lat: 31.6340, lon: 74.8723, tzOffset: 330 },
  { name: 'Navi Mumbai', state: 'Maharashtra', lat: 19.0330, lon: 73.0297, tzOffset: 330 },
  { name: 'Allahabad', state: 'Uttar Pradesh', lat: 25.4358, lon: 81.8463, tzOffset: 330 },
  { name: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.4358, lon: 81.8463, tzOffset: 330 },
  { name: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lon: 85.3096, tzOffset: 330 },
  { name: 'Howrah', state: 'West Bengal', lat: 22.5958, lon: 88.2636, tzOffset: 330 },
  { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558, tzOffset: 330 },
  { name: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lon: 79.9864, tzOffset: 330 },
  { name: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lon: 78.1828, tzOffset: 330 },
  { name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480, tzOffset: 330 },
  { name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lon: 73.0243, tzOffset: 330 },
  { name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198, tzOffset: 330 },
  { name: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lon: 81.6296, tzOffset: 330 },
  { name: 'Kota', state: 'Rajasthan', lat: 25.2138, lon: 75.8648, tzOffset: 330 },
  { name: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lon: 76.7794, tzOffset: 330 },
  { name: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362, tzOffset: 330 },
  { name: 'Solapur', state: 'Maharashtra', lat: 17.6599, lon: 75.9064, tzOffset: 330 },
  { name: 'Hubli', state: 'Karnataka', lat: 15.3647, lon: 75.1240, tzOffset: 330 },
  { name: 'Mysore', state: 'Karnataka', lat: 12.2958, lon: 76.6394, tzOffset: 330 },
  { name: 'Mysuru', state: 'Karnataka', lat: 12.2958, lon: 76.6394, tzOffset: 330 },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lon: 78.7047, tzOffset: 330 },
  { name: 'Bareilly', state: 'Uttar Pradesh', lat: 28.3670, lon: 79.4304, tzOffset: 330 },
  { name: 'Aligarh', state: 'Uttar Pradesh', lat: 27.8974, lon: 78.0880, tzOffset: 330 },
  { name: 'Tiruppur', state: 'Tamil Nadu', lat: 11.1085, lon: 77.3411, tzOffset: 330 },
  { name: 'Moradabad', state: 'Uttar Pradesh', lat: 28.8386, lon: 78.7733, tzOffset: 330 },
  { name: 'Jalandhar', state: 'Punjab', lat: 31.3260, lon: 75.5762, tzOffset: 330 },
  { name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lon: 85.8245, tzOffset: 330 },
  { name: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lon: 78.1460, tzOffset: 330 },
  { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lon: 76.9366, tzOffset: 330 },
  { name: 'Trivandrum', state: 'Kerala', lat: 8.5241, lon: 76.9366, tzOffset: 330 },
  { name: 'Kochi', state: 'Kerala', lat: 9.9312, lon: 76.2673, tzOffset: 330 },
  { name: 'Cochin', state: 'Kerala', lat: 9.9312, lon: 76.2673, tzOffset: 330 },
  { name: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lon: 78.0322, tzOffset: 330 },
  { name: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lon: 77.3910, tzOffset: 330 },
  { name: 'Gurugram', state: 'Haryana', lat: 28.4595, lon: 77.0266, tzOffset: 330 },
  { name: 'Gurgaon', state: 'Haryana', lat: 28.4595, lon: 77.0266, tzOffset: 330 },
  { name: 'Mangalore', state: 'Karnataka', lat: 12.9141, lon: 74.8560, tzOffset: 330 },
  { name: 'Mangaluru', state: 'Karnataka', lat: 12.9141, lon: 74.8560, tzOffset: 330 },
  { name: 'Jammu', state: 'Jammu & Kashmir', lat: 32.7266, lon: 74.8570, tzOffset: 330 },
  { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734, tzOffset: 330 },
  { name: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lon: 73.7125, tzOffset: 330 },
  { name: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lon: 79.4192, tzOffset: 330 },
  { name: 'Ujjain', state: 'Madhya Pradesh', lat: 23.1765, lon: 75.7885, tzOffset: 330 },
  { name: 'Mathura', state: 'Uttar Pradesh', lat: 27.4924, lon: 77.6737, tzOffset: 330 },
  { name: 'Gorakhpur', state: 'Uttar Pradesh', lat: 26.7606, lon: 83.3732, tzOffset: 330 },
  { name: 'Bokaro', state: 'Jharkhand', lat: 23.6693, lon: 86.1511, tzOffset: 330 },
  { name: 'Siliguri', state: 'West Bengal', lat: 26.7271, lon: 88.6393, tzOffset: 330 },
  { name: 'Cuttack', state: 'Odisha', lat: 20.4625, lon: 85.8830, tzOffset: 330 },
  { name: 'Jamshedpur', state: 'Jharkhand', lat: 22.8046, lon: 86.2029, tzOffset: 330 },
  { name: 'Bikaner', state: 'Rajasthan', lat: 28.0229, lon: 73.3119, tzOffset: 330 },
  { name: 'Ajmer', state: 'Rajasthan', lat: 26.4499, lon: 74.6399, tzOffset: 330 },
  { name: 'Bhilai', state: 'Chhattisgarh', lat: 21.2094, lon: 81.3784, tzOffset: 330 },
  { name: 'Warangal', state: 'Telangana', lat: 17.9784, lon: 79.5941, tzOffset: 330 },
  { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365, tzOffset: 330 },
  { name: 'Bhavnagar', state: 'Gujarat', lat: 21.7645, lon: 72.1519, tzOffset: 330 },
  { name: 'Durgapur', state: 'West Bengal', lat: 23.5204, lon: 87.3119, tzOffset: 330 },
  { name: 'Asansol', state: 'West Bengal', lat: 23.6889, lon: 86.9661, tzOffset: 330 },
  { name: 'Nanded', state: 'Maharashtra', lat: 19.1383, lon: 77.3210, tzOffset: 330 },
  { name: 'Kolhapur', state: 'Maharashtra', lat: 16.7050, lon: 74.2433, tzOffset: 330 },
  { name: 'Sangli', state: 'Maharashtra', lat: 16.8524, lon: 74.5815, tzOffset: 330 },
  { name: 'Pondicherry', state: 'Puducherry', lat: 11.9416, lon: 79.8083, tzOffset: 330 },
  { name: 'Puducherry', state: 'Puducherry', lat: 11.9416, lon: 79.8083, tzOffset: 330 },
  { name: 'Imphal', state: 'Manipur', lat: 24.8170, lon: 93.9368, tzOffset: 330 },
  { name: 'Shillong', state: 'Meghalaya', lat: 25.5788, lon: 91.8933, tzOffset: 330 },
  { name: 'Gangtok', state: 'Sikkim', lat: 27.3389, lon: 88.6065, tzOffset: 330 },
  { name: 'Agartala', state: 'Tripura', lat: 23.8315, lon: 91.2868, tzOffset: 330 },
  { name: 'Aizawl', state: 'Mizoram', lat: 23.7271, lon: 92.7176, tzOffset: 330 },
  { name: 'Itanagar', state: 'Arunachal Pradesh', lat: 27.0844, lon: 93.6053, tzOffset: 330 },
  { name: 'Panaji', state: 'Goa', lat: 15.4909, lon: 73.8278, tzOffset: 330 },
  { name: 'Dibrugarh', state: 'Assam', lat: 27.4728, lon: 94.9120, tzOffset: 330 },
  { name: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311, tzOffset: 330 },
  { name: 'Nellore', state: 'Andhra Pradesh', lat: 14.4426, lon: 79.9865, tzOffset: 330 },
  { name: 'Belgaum', state: 'Karnataka', lat: 15.8497, lon: 74.4977, tzOffset: 330 },
  { name: 'Belagavi', state: 'Karnataka', lat: 15.8497, lon: 74.4977, tzOffset: 330 },
  { name: 'Kozhikode', state: 'Kerala', lat: 11.2588, lon: 75.7804, tzOffset: 330 },
  { name: 'Calicut', state: 'Kerala', lat: 11.2588, lon: 75.7804, tzOffset: 330 },
  { name: 'Thrissur', state: 'Kerala', lat: 10.5276, lon: 76.2144, tzOffset: 330 },
  { name: 'Kollam', state: 'Kerala', lat: 8.8932, lon: 76.6141, tzOffset: 330 },
  { name: 'Vellore', state: 'Tamil Nadu', lat: 12.9165, lon: 79.1325, tzOffset: 330 },
  { name: 'Erode', state: 'Tamil Nadu', lat: 11.3410, lon: 77.7172, tzOffset: 330 },
  { name: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.7139, lon: 77.7567, tzOffset: 330 },
  { name: 'Rishikesh', state: 'Uttarakhand', lat: 30.0869, lon: 78.2676, tzOffset: 330 },
  { name: 'Haridwar', state: 'Uttarakhand', lat: 29.9457, lon: 78.1642, tzOffset: 330 },
];

// Aliases for common alternate names
const ALIASES = {
  'bombay': 'Mumbai',
  'madras': 'Chennai',
  'calcutta': 'Kolkata',
  'benares': 'Varanasi',
  'banaras': 'Varanasi',
  'kashi': 'Varanasi',
  'baroda': 'Vadodara',
  'poona': 'Pune',
  'simla': 'Shimla',
  'ooty': 'Udhagamandalam',
  'trivandrum': 'Thiruvananthapuram',
  'cochin': 'Kochi',
  'calicut': 'Kozhikode',
  'mangalore': 'Mangaluru',
  'mysore': 'Mysuru',
  'belgaum': 'Belagavi',
  'pondicherry': 'Puducherry',
  'gurgaon': 'Gurugram',
  'allahabad': 'Prayagraj',
};

export function findCity(input) {
  if (!input) return getDefault();

  // Clean input: take the first part before comma, trim, lowercase
  const cleaned = input.split(',')[0].trim().toLowerCase();

  // Check alias
  const aliasTarget = ALIASES[cleaned];
  const searchName = aliasTarget ? aliasTarget.toLowerCase() : cleaned;

  // Exact match
  let city = CITIES.find((c) => c.name.toLowerCase() === searchName);
  if (city) return city;

  // Partial match (starts with)
  city = CITIES.find((c) => c.name.toLowerCase().startsWith(searchName));
  if (city) return city;

  // Contains match
  city = CITIES.find((c) => c.name.toLowerCase().includes(searchName));
  if (city) return city;

  // Try matching against the original cleaned input (in case alias lookup changed it)
  if (aliasTarget) {
    city = CITIES.find((c) => c.name.toLowerCase() === cleaned);
    if (city) return city;
  }

  // Also try matching state
  city = CITIES.find(
    (c) => c.state.toLowerCase().includes(cleaned) || cleaned.includes(c.name.toLowerCase())
  );
  if (city) return city;

  // Default: center of India with IST
  return getDefault();
}

function getDefault() {
  return {
    name: 'India (Default)',
    state: '',
    lat: 22.0,
    lon: 78.0,
    tzOffset: 330,
    isDefault: true,
  };
}

export function getAllCities() {
  return CITIES;
}
