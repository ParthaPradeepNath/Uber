import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import LocationSearch from '../components/LocationSearch';
import { rideApi } from '../services/rideService';
import rideSocket from '../utils/rideSocket';

const VEHICLES = [
    { type: 'car', label: 'Uber Go', desc: 'Comfortable sedan', icon: '🚗' },
    { type: 'auto', label: 'Uber Auto', desc: 'Affordable auto rickshaw', icon: '🛺' },
    { type: 'motorcycle', label: 'Uber Moto', desc: 'Quickest bike ride', icon: '🏍️' },
];

const STATUS_STEP = {
    'pending': 0,
    'accepted': 1,
    'in-progress': 2,
    'completed': 3,
};

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
    const [ captainLocation, setCaptainLocation ] = useState(null);
    const [ waitTime, setWaitTime ] = useState(0);

    useEffect(() => {
        if (!user?._id) return;
        rideSocket.connect('user', user._id);
        return () => rideSocket.disconnect();
    }, [ user ]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPickup((prev) => prev || {
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
            setActiveRide(data.ride);
            setWaitTime(0);
        } catch (error) {
            console.error('Ride request failed', error);
            alert('Failed to request ride. Please try again.');
        } finally {
            setRequesting(false);
        }
    };

    useEffect(() => {
        if (!activeRide) return;

        const unsubAccepted = rideSocket.on('ride-accepted', (msg) => {
            if (msg.ride && msg.ride._id === activeRide._id) {
                setActiveRide((prev) => ({ ...prev, ...msg.ride, status: 'accepted' }));
                if (msg.ride.captain?._id) {
                    rideSocket.followCaptain(msg.ride.captain._id);
                }
            }
        });

        const unsubCaptLoc = rideSocket.on('captain-location', (msg) => {
            setCaptainLocation({ lat: msg.latitude, lng: msg.longitude });
        });

        const unsubStarted = rideSocket.on('ride-started', (msg) => {
            if (msg.ride && msg.ride._id === activeRide._id) {
                setActiveRide((prev) => ({ ...prev, status: 'in-progress' }));
            }
        });

        const unsubCompleted = rideSocket.on('ride-completed', (msg) => {
            if (msg.ride && msg.ride._id === activeRide._id) {
                setActiveRide((prev) => ({ ...prev, ...msg.ride, status: 'completed' }));
            }
        });

        return () => {
            unsubAccepted();
            unsubCaptLoc();
            unsubStarted();
            unsubCompleted();
        };
    }, [ activeRide ]);

    useEffect(() => {
        if (!activeRide || ![ 'accepted', 'in-progress' ].includes(activeRide.status)) return;
        const timer = setInterval(() => setWaitTime((t) => t + 1), 1000);
        return () => clearInterval(timer);
    }, [ activeRide ]);

    const cancelRide = async () => {
        try {
            await rideApi.cancel(activeRide._id);
            setActiveRide(null);
            setFareData(null);
            setDestination(null);
            setCaptainLocation(null);
        } catch (error) {
            console.error('Cancel failed', error);
        }
    };

    const markers = [];
    if (pickup) markers.push({ lat: pickup.latitude, lng: pickup.longitude, color: '#10b461', popup: 'Pickup' });
    if (destination) markers.push({ lat: destination.latitude, lng: destination.longitude, color: '#e11d48', popup: 'Destination' });
    if (captainLocation && [ 'accepted', 'in-progress' ].includes(activeRide?.status)) {
        markers.push({ lat: captainLocation.lat, lng: captainLocation.lng, color: '#111', popup: 'Your driver' });
    }

    return (
        <div className="h-screen flex flex-col">
            <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm z-10">
                <div>
                    <h1 className="font-bold text-lg">Where to?</h1>
                    <p className="text-sm text-gray-500">Hi, {user?.fullname?.firstname}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/ride-history" className="text-sm text-gray-600 hover:text-black">
                        Trips
                    </Link>
                    <button
                        onClick={async () => {
                            rideSocket.disconnect();
                            await logout('user');
                            navigate('/login');
                        }}
                        className="text-sm text-gray-600 hover:text-black"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="relative flex-1">
                <MapView
                    center={
                        captainLocation
                            ? [ captainLocation.lat, captainLocation.lng ]
                            : pickup
                                ? [ pickup.latitude, pickup.longitude ]
                                : [ 12.9716, 77.5946 ]
                    }
                    markers={markers}
                />
            </div>

            <div className="absolute top-16 left-0 right-0 px-4 space-y-3 z-20">
                {!activeRide && (
                    <>
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
                    </>
                )}
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
                    <RideStatusPanel
                        ride={activeRide}
                        waitTime={waitTime}
                        onCancel={cancelRide}
                    />
                )}
            </div>
        </div>
    );
};

const RideStatusPanel = ({ ride, waitTime, onCancel }) => {
    const step = STATUS_STEP[ ride.status ] || 0;
    const steps = [ 'Waiting', 'Driver on the way', 'In progress', 'Completed' ];

    if (ride.status === 'pending') {
        return (
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-lg">Finding your captain...</h2>
                    <span className="text-gray-500 text-sm">{waitTime}s</span>
                </div>
                <div className="animate-pulse bg-gray-100 rounded-lg px-3 py-2 text-sm mb-3">
                    <p className="font-medium">{ride.pickupAddress}</p>
                    <p className="text-gray-500">→ {ride.destinationAddress}</p>
                    <p className="font-bold mt-1">${ride.fare?.toFixed(2)}</p>
                </div>
                <button onClick={onCancel} className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg">
                    Cancel Ride
                </button>
            </div>
        );
    }

    if (ride.status === 'completed') {
        return (
            <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="font-bold text-lg mb-1">Ride Complete</h2>
                <p className="text-gray-600 text-sm mb-3">Thanks for riding with us</p>
                <div className="bg-green-50 rounded-lg px-3 py-2 text-sm mb-3">
                    <p className="font-medium">{ride.pickupAddress}</p>
                    <p className="text-gray-500">→ {ride.destinationAddress}</p>
                    <p className="font-bold mt-1 text-green-700">
                        Paid ${ride.fare?.toFixed(2)} • {ride.payment === 'completed' ? '✓' : 'Pending'}
                    </p>
                </div>
                <button onClick={onCancel} className="w-full bg-black text-white font-semibold py-3 rounded-lg">
                    Book Another Ride
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-lg">
                    {ride.status === 'accepted' ? 'Driver on the way' : 'On your way'}
                </h2>
                <span className="text-gray-500 text-sm">{Math.floor(waitTime / 60)}:{String(waitTime % 60).padStart(2, '0')}</span>
            </div>

            <div className="flex items-center gap-2 mb-3">
                {steps.map((s, i) => (
                    <React.Fragment key={s}>
                        <div className={`flex-1 h-1.5 rounded ${i <= step ? 'bg-green-500' : 'bg-gray-200'}`} />
                    </React.Fragment>
                ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-3">
                {steps.map((s, i) => (
                    <span key={s} className={i === step ? 'text-green-600 font-medium' : ''}>{s}</span>
                ))}
            </div>

            <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm mb-3">
                <p className="font-medium">{ride.pickupAddress}</p>
                <p className="text-gray-500">→ {ride.destinationAddress}</p>
                <p className="font-bold mt-1">${ride.fare?.toFixed(2)}</p>
            </div>

            <button onClick={onCancel} className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg">
                End Ride
            </button>
        </div>
    );
};

export default UserDashboard;
