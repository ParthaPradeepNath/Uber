import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import { captainApi } from '../services/authService';
import { rideApi } from '../services/rideService';
import rideSocket from '../utils/rideSocket';

const CaptainDashboard = () => {
    const { captain, logout } = useAuth();
    const navigate = useNavigate();
    const [ position, setPosition ] = useState(null);
    const [ isOnline, setIsOnline ] = useState(false);
    const [ incomingRide, setIncomingRide ] = useState(null);
    const watchIdRef = useRef(null);

    const startGeolocation = useCallback(() => {
        if (!navigator.geolocation) return;

        watchIdRef.current = navigator.geolocation.watchPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition({ latitude, longitude });
                try {
                    await captainApi.updateLocation(latitude, longitude);
                    rideSocket.updateLocation(latitude, longitude);
                } catch (error) {
                    console.error('Location update failed', error);
                }
            },
            (error) => console.error('Geolocation error', error),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
        );
    }, []);

    const stopGeolocation = useCallback(() => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    }, []);

    const toggleOnline = useCallback(async () => {
        try {
            const { data } = await captainApi.toggleStatus();
            const next = data.captain.status === 'active';
            setIsOnline(next);

            if (next) {
                startGeolocation();
            } else {
                stopGeolocation();
            }
        } catch (error) {
            console.error('Toggle failed', error);
        }
    }, [ startGeolocation, stopGeolocation ]);

    useEffect(() => {
        if (!isOnline || !captain?._id) return;

        const unsubRideRequest = rideSocket.on('ride-request', (msg) => {
            setIncomingRide(msg.ride);
        });

        return () => {
            unsubRideRequest();
        };
    }, [ isOnline, captain ]);

    useEffect(() => {
        return () => {
            stopGeolocation();
            rideSocket.disconnect();
        };
    }, [ stopGeolocation ]);

    const acceptRide = async () => {
        if (!incomingRide) return;
        try {
            const { data } = await rideApi.confirm(incomingRide._id);
            setIncomingRide(null);
            rideSocket.acceptRide(data.ride._id, captain._id);
        } catch (error) {
            console.error('Accept failed', error);
        }
    };

    const rejectRide = () => {
        if (incomingRide) {
            rideSocket.rejectRide(incomingRide._id);
        }
        setIncomingRide(null);
    };

    return (
        <div className="h-screen flex flex-col">
            <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm z-10">
                <div>
                    <h1 className="font-bold text-lg">Captain Dashboard</h1>
                    <p className="text-sm text-gray-500 capitalize">
                        {captain?.fullname?.firstname} • {captain?.vehicle?.vehicleType}
                    </p>
                </div>
                <button
                    onClick={async () => {
                        stopGeolocation();
                        rideSocket.disconnect();
                        await logout('captain');
                        navigate('/captain-login');
                    }}
                    className="text-sm text-gray-600 hover:text-black"
                >
                    Logout
                </button>
            </header>

            <div className="relative flex-1">
                <MapView
                    center={position ? [ position.latitude, position.longitude ] : [ 12.9716, 77.5946 ]}
                    markers={
                        position
                            ? [ { lat: position.latitude, lng: position.longitude, color: '#10b461', popup: 'You' } ]
                            : []
                    }
                />

                {incomingRide && (
                    <div className="absolute bottom-6 left-4 right-4 bg-white rounded-xl shadow-lg z-20 p-4">
                        <h2 className="font-bold text-lg mb-2">New Ride Request</h2>
                        <div className="space-y-1 text-sm mb-3">
                            <p className="flex justify-between">
                                <span className="text-gray-500">Pickup</span>
                                <span className="font-medium">{incomingRide.pickupAddress}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-500">Destination</span>
                                <span className="font-medium">{incomingRide.destinationAddress}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-500">Distance</span>
                                <span className="font-medium">{incomingRide.distance?.toFixed(1)} km</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-500">Fare</span>
                                <span className="font-bold text-green-600">${incomingRide.fare?.toFixed(2)}</span>
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={rejectRide}
                                className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-lg"
                            >
                                Decline
                            </button>
                            <button
                                onClick={acceptRide}
                                className="flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white px-4 py-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-10">
                {!isOnline ? (
                    <button
                        onClick={toggleOnline}
                        className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg"
                    >
                        Go Online
                    </button>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-green-600">● Online</span>
                            <span className="text-sm text-gray-500">
                                {position ? 'Location streaming' : 'Getting location...'}
                            </span>
                        </div>
                        <button
                            onClick={toggleOnline}
                            className="w-full bg-gray-800 text-white font-semibold py-3 rounded-lg"
                        >
                            Go Offline
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaptainDashboard;
