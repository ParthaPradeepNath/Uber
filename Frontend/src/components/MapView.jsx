import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = ({
    center,
    zoom = 13,
    markers = [],
    polyline = null,
    onMapClick,
    className = '',
    height = '100%',
}) => {
    const mapRef = useRef(null);
    const containerRef = useRef(null);
    const onMapClickRef = useRef(onMapClick);
    const markersRef = useRef([]);
    const polylineRef = useRef(null);

    useEffect(() => {
        onMapClickRef.current = onMapClick;
    }, [ onMapClick ]);

    useEffect(() => {
        if (!containerRef.current) return;

        const map = L.map(containerRef.current, {
            center,
            zoom,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        map.on('click', (e) => {
            if (onMapClickRef.current) {
                onMapClickRef.current(e.latlng);
            }
        });

        mapRef.current = map;
        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        markers.forEach((marker) => {
            const icon =
                marker.icon ||
                L.divIcon({
                    className: '',
                    html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow" style="background:${marker.color || '#000'}"></div>`,
                });

            const m = L.marker([ marker.lat, marker.lng ], { icon }).addTo(map);
            if (marker.popup) m.bindPopup(marker.popup);
            markersRef.current.push(m);
        });
    }, [ markers ]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (polylineRef.current) {
            map.removeLayer(polylineRef.current);
        }

        if (polyline && polyline.length > 1) {
            polylineRef.current = L.polyline(polyline, {
                color: '#111',
                weight: 4,
                opacity: 0.8,
            }).addTo(map);
            map.fitBounds(polylineRef.current.getBounds(), { padding: [ 40, 40 ] });
        }
    }, [ polyline ]);

    useEffect(() => {
        const map = mapRef.current;
        if (map && center) {
            map.setView(center, map.getZoom());
        }
    }, [ center ]);

    return (
        <div
            ref={containerRef}
            className={`${className}`}
            style={{ height, width: '100%', zIndex: 0 }}
        />
    );
};

export default MapView;
