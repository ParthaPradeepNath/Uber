import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CaptainSignup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [vehicle, setVehicle] = useState({
        color: '',
        plate: '',
        capacity: 4,
        vehicleType: 'car',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { registerCaptain } = useAuth();
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await registerCaptain({
                email,
                password,
                fullname: { firstname: firstName, lastname: lastName },
                vehicle: {
                    color: vehicle.color,
                    plate: vehicle.plate,
                    capacity: Number(vehicle.capacity),
                    vehicleType: vehicle.vehicleType,
                },
            });
            navigate('/captain-home');
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.errors?.[0]?.msg ||
                'Registration failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="py-5 px-5 h-screen flex flex-col justify-between overflow-y-auto">
                <div>
                    <img
                        className="w-16 mb-10"
                        src="https://pngimg.com/d/uber_PNG24.png"
                        alt="Uber Logo"
                    />
                    <form onSubmit={submitHandler}>
                        <h3 className="text-lg font-medium mb-2">What's our Captain's name</h3>
                        <div className="flex gap-4 mb-6">
                            <input
                                required
                                className="bg-[#eeee] w-1/2 rounded px-4 py-2 text-base placeholder:text-sm"
                                type="text"
                                placeholder="First name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            <input
                                required
                                className="bg-[#eeee] w-1/2 rounded px-4 py-2 text-base placeholder:text-sm"
                                type="text"
                                placeholder="Last name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>

                        <h3 className="text-base font-medium mb-2">What's our Captain's email</h3>
                        <input
                            required
                            className="bg-[#eeee] mb-6 rounded px-4 py-2 w-full text-base placeholder:text-sm"
                            type="email"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <h3 className="text-base font-medium mb-2">Enter Password</h3>
                        <input
                            required
                            className="bg-[#eeee] mb-6 rounded px-4 py-2 w-full text-lg placeholder:text-base"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <h3 className="text-base font-medium mb-2">Vehicle Color</h3>
                        <input
                            required
                            className="bg-[#eeee] mb-6 rounded px-4 py-2 w-full text-base"
                            type="text"
                            placeholder="e.g. Red"
                            value={vehicle.color}
                            onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })}
                        />

                        <h3 className="text-base font-medium mb-2">Vehicle Plate</h3>
                        <input
                            required
                            className="bg-[#eeee] mb-6 rounded px-4 py-2 w-full text-base"
                            type="text"
                            placeholder="e.g. MH-12-AB-1234"
                            value={vehicle.plate}
                            onChange={(e) => setVehicle({ ...vehicle, plate: e.target.value })}
                        />

                        <h3 className="text-base font-medium mb-2">Vehicle Capacity</h3>
                        <input
                            required
                            className="bg-[#eeee] mb-6 rounded px-4 py-2 w-full text-base"
                            type="number"
                            min="1"
                            placeholder="e.g. 4"
                            value={vehicle.capacity}
                            onChange={(e) => setVehicle({ ...vehicle, capacity: e.target.value })}
                        />

                        <h3 className="text-base font-medium mb-2">Vehicle Type</h3>
                        <select
                            className="bg-[#eeee] mb-6 rounded px-4 py-2 w-full text-base"
                            value={vehicle.vehicleType}
                            onChange={(e) =>
                                setVehicle({ ...vehicle, vehicleType: e.target.value })
                            }
                        >
                            <option value="car">Car</option>
                            <option value="auto">Auto Rickshaw</option>
                            <option value="motorcycle">Motorcycle</option>
                        </select>

                        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

                        <button
                            disabled={loading}
                            className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 w-full text-lg disabled:opacity-50"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                    <p className="text-center">
                        Already have an account?{' '}
                        <Link to="/captain-login" className="text-blue-600">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CaptainSignup;
