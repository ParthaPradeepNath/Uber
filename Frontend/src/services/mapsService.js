export const mapsApi = {
    geocode: async (query) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('Geocoding failed');
        const data = await response.json();
        return data.map((item) => ({
            name: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
        }));
    },
};
