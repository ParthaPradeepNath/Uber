import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rideApi } from '../services/rideService';

const RideHistory = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [ rides, setRides ] = useState([]);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await rideApi.history();
                setRides(data.rides);
            } catch (error) {
                console.error('Failed to load ride history', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        accepted: 'bg-blue-100 text-blue-800',
        arriving: 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-indigo-100 text-indigo-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
                <Link to="/user-home" className="text-blue-600 text-sm font-medium">
                    ← Back to home
                </Link>
                <h1 className="font-bold text-lg">Your Trips</h1>
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

            <main className="max-w-md mx-auto px-4 py-6">
                {loading ? (
                    <p className="text-center text-gray-500">Loading trips...</p>
                ) : rides.length === 0 ? (
                    <div className="text-center mt-20">
                        <div className="text-5xl mb-4">🗺️</div>
                        <h2 className="font-semibold text-lg mb-2">No trips yet</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            Your ride history will appear here once you take your first trip.
                        </p>
                        <Link
                            to="/user-home"
                            className="bg-black text-white font-semibold px-6 py-3 rounded-lg"
                        >
                            Book your first ride
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {rides.map((ride) => (
                            <div key={ride._id} className="bg-white rounded-xl shadow p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[ ride.status ] || 'bg-gray-100'}`}>
                                        {ride.status}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(ride.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm font-medium">{ride.pickupAddress}</p>
                                <p className="text-xs text-gray-500 mb-2">→ {ride.destinationAddress}</p>
                                <div className="flex items-center justify-between border-t pt-2">
                                    <span className="text-sm text-gray-600 capitalize">
                                        {ride.vehicleType} • {ride.distance?.toFixed(1)} km
                                    </span>
                                    <span className="font-bold">${ride.fare?.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default RideHistory;
