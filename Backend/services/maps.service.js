const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

const VEHICLE_RATES = {
    car: { baseFare: 2, perKm: 1.5, perMin: 0.25 },
    auto: { baseFare: 1.5, perKm: 1.0, perMin: 0.2 },
    motorcycle: { baseFare: 1.0, perKm: 0.75, perMin: 0.15 },
};

const getCoordinatesFromAddress = async (address) => {
    const url = `${NOMINATIM_URL}?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'UberClone/1.0',
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Unable to geocode address');
    }

    const data = await response.json();

    if (!data.length) {
        throw new Error('Address not found');
    }

    const { lat, lon } = data[0];
    return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
    };
};

const getDistanceAndDuration = async (origin, destination) => {
    const [lng1, lat1] = [origin.longitude, origin.latitude];
    const [lng2, lat2] = [destination.longitude, destination.latitude];

    const url = `${OSRM_URL}/${lng1},${lat1};${lng2},${lat2}?overview=false`;
    const response = await fetch(url);

    if (!response.ok) {
        const fallback = haversineDistance(origin, destination);
        return {
            distance: fallback,
            duration: (fallback / 15) * 3600,
        };
    }

    const data = await response.json();

    if (!data.routes || !data.routes.length) {
        const fallback = haversineDistance(origin, destination);
        return {
            distance: fallback,
            duration: (fallback / 15) * 3600,
        };
    }

    const route = data.routes[0];
    return {
        distance: route.distance / 1000,
        duration: route.duration / 60,
    };
};

const haversineDistance = (point1, point2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(point2.latitude - point1.latitude);
    const dLng = toRad(point2.longitude - point1.longitude);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(point1.latitude)) *
            Math.cos(toRad(point2.latitude)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const calculateFare = (distanceKm, durationMin, vehicleType) => {
    const rate = VEHICLE_RATES[vehicleType] || VEHICLE_RATES.car;
    const fare = rate.baseFare + rate.perKm * distanceKm + rate.perMin * durationMin;
    return Math.round(fare * 100) / 100;
};

module.exports = {
    getCoordinatesFromAddress,
    getDistanceAndDuration,
    haversineDistance,
    calculateFare,
    VEHICLE_RATES,
};
