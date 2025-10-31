// Calculate distance between two coordinates using Haversine formula
// Returns distance in kilometers
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Calculate fare estimate based on distance
// Base fare + per km rate
export function calculateFare(distanceKm) {
  const BASE_FARE = 50; // Base fare in local currency
  const PER_KM_RATE = 15; // Per kilometer rate
  
  const fare = BASE_FARE + (distanceKm * PER_KM_RATE);
  return Math.round(fare * 100) / 100; // Round to 2 decimal places
}

