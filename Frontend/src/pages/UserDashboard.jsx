import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import LocationSearch from '../components/LocationSearch';
import { rideApi } from '../services/rideService';
import rideSocket from '../utils/rideSocket';

const VEHICLES = [
    { type: 'car', label: 'Uber Go', desc: 'Comfortable sedan', icon: '🚗', base: 2, perKm: 1.5 },
    { type: 'auto', label: 'Uber Auto', desc: 'Affordable auto rickshaw', icon: '🛺', base: 1.5, perKm: 1.0 },
    { type: 'motorcycle', label: 'Uber Moto', desc: 'Quickest bike ride', icon: '🏍️', base: 1.0, perKm: 0.75 },
];

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [ pickup, setPickup ] = useState(null);
    const [ destination, setDestination ] = useState(null);
    const [ selectedVehicle, setSelectedVehicle ] = useState('car');
    const [ fareData, setFareData ] = useState(null);
    const [ estimating, setEstimating ] = useState(false);
    const [ requesting, setRequesting ] = useState(false);
    const [ activeRide, setActiveRide ] = useState(null);
    const [ waitTime, setWaitTime ] = useState(0);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPickup((prev) => prev || {
                        label: 'My location',
                        name: 'My location',
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    });
                },
                () => {},
                { enableHighAccuracy: true, timeout: 5000 },
            );
        }
    }, []);

    const estimateFare = useCallback(async () => {
        if (!pickup || !destination) return;
        setEstimating(true);
        try {
            const { data } = await rideApi.getFare(pickup.name, destination.name);
            setFareData(data);
        } catch (error) {
            console.error('Fare estimation failed', error);
            setFareData(null);
        } finally {
            setEstimating(false);
        }
    }, [ pickup, destination ]);

    useEffect(() => {
        if (pickup && destination && pickup.name !== destination.name) {
            estimateFare();
        }
    }, [ pickup, destination, estimateFare ]);

    const requestRide = async () => {
        setRequesting(true);
        try {
            const { data } = await rideApi.create(pickup.name, destination.name, selectedVehicle);
            const { ride } = data;
            setActiveRide(ride);
            setWaitTime(0);

            const timer = setInterval(() => {
                setWaitTime((t) => t + 1);
            }, 1000);
            return () => clearInterval(timer);
        } catch (error) {
            console.error('Ride request failed', error);
            alert('Failed to request ride. Please try again.');
        } finally {
            setRequesting(false);
        }
    };

    useEffect(() => {
        if (!activeRide) return;

        const unsubscribeAccepted = rideSocket.on('ride-accepted', (msg) => {
            setActiveRide((prev) => prev ? {
                ...prev,
                status: 'accepted',
                captainId: msg.captainId,
            } : prev);
        });

        return () => {
            unsubscribeAccepted();
        };
    }, [ activeRide ]);

    const cancelRide = async () => {
        try {
            await rideApi.cancel(activeRide._id);
            setActiveRide(null);
            setFareData(null);
            setDestination(null);
        } catch (error) {
            console.error('Cancel failed', error);
        }
    };

    const fields = [];
    if (pickup) fields.push([ pickup.latitude, pickup.longitude ]);
    if (destination) fields.push([ destination.latitude, destination.longitude ]);

    return (
        <div className="h-screen flex flex-col">
            <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm z-10">
                <div>
                    <h1 className="font-bold text-lg">Where to?</h1>
                    <p className="text-sm text-gray-500">Hi, {user?.fullname?.firstname}</p>
                </div>
                <button
                    onClick={async () => {
                        await logout('user');
                        navigate('/login');
                    }}
                    className="text-sm text-gray-600 hover:text-black"
                >
                    Logout
                </button>
            </header>

            <div className="relative flex-1">
                <MapView
                    center={[ 12.9716, 77.5946 ]}
                    markers={fields.map((coord, i) => ({
                        lat: coord[ 0 ],
                        lng: coord[ 1 ],
                        color: i === 0 ? '#10b461' : '#e11d48',
                        popup: i === 0 ? 'Pickup' : 'Destination',
                    }))}
                />
            </div>

            <div className="absolute top-16 left-0 right-0 px-4 space-y-3 z-20">
                <LocationSearch
                    placeholder="Enter pickup location"
                    value={pickup?.name || ''}
                    onSelect={(loc) => setPickup(loc)}
                    icon={<span className="text-green-600">●</span>}
                />
                <LocationSearch
                    placeholder="Enter destination"
                    value={destination?.name || ''}
                    onSelect={(loc) => setDestination(loc)}
                    icon={<span className="text-red-600">●</span>}
                />
            </div>

            <div className="bg-white px-4 py-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-10">
                {!activeRide ? (
                    <>
                        {fareData ? (
                            <>
                                <div className="flex gap-3 mb-4">
                                    {VEHICLES.map((v) => {
                                        const fare = fareData.fares[ v.type ]?.fare;
                                        return (
                                            <button
                                                key={v.type}
                                                onClick={() => setSelectedVehicle(v.type)}
                                                className={`flex-1 text-left border-2 rounded-xl p-3 transition ${
                                                    selectedVehicle === v.type
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200'
                                                }`}
                                            >
                                                <div className="text-2xl">{v.icon}</div>
                                                <div className="font-semibold text-sm">{v.label}</div>
                                                <div className="text-xs text-gray-500">{v.desc}</div>
                                                <div className="font-bold mt-1 text-sm">
                                                    ${fare ? fare.toFixed(2) : '—'}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 mb-3">
                                    <span>{fareData.distance.toFixed(1)} km</span>
                                    <span>~{Math.round(fareData.duration)} min</span>
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-gray-500 text-sm mb-3">
                                {estimating ? 'Estimating fare...' : 'Set pickup and destination to see fares'}
                            </p>
                        )}

                        <button
                            disabled={!fareData || requesting}
                            onClick={requestRide}
                            className="w-full bg-black text-white font-semibold py-3 rounded-lg disabled:opacity-40"
                        >
                            {requesting ? 'Requesting...' : 'Request Ride'}
                        </button>
                    </>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-bold text-lg">Finding your captain...</h2>
                            <span className="text-gray-500 text-sm">{waitTime}s</span>
                        </div>
                        <div className="animate-pulse bg-gray-100 rounded-lg px-3 py-2 text-sm mb-3">
                            <p className="font-medium">{activeRide.pickupAddress}</p>
                            <p className="text-gray-500">→ {activeRide.destinationAddress}</p>
                            <p className="font-bold mt-1">${activeRide.fare.toFixed(2)}</p>
                        </div>
                        <button
                            onClick={cancelRide}
                            className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg"
                        >
                            Cancel Ride
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
