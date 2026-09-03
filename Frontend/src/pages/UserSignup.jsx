import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserSignup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { registerUser } = useAuth();
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await registerUser({
                email,
                password,
                fullname: { firstname: firstName, lastname: lastName },
            });
            navigate('/user-home');
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
            <div className="p-7 h-screen flex flex-col justify-between">
                <div>
                    <img
                        className="w-16 mb-10"
                        src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
                        alt="Uber Logo"
                    />
                    <form onSubmit={submitHandler}>
                        <h3 className="text-base font-medium mb-2">What's your name</h3>
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

                        <h3 className="text-base font-medium mb-2">What's your email</h3>
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
                        <Link to="/login" className="text-blue-600">
                            Login here
                        </Link>
                    </p>
                </div>

                <div>
                    <p className="text-[10px] leading-tight">
                        This site is protected by reCAPTCHA and the{' '}
                        <span className="underline">Google Privacy Policy</span> and{' '}
                        <span className="underline">Terms of Service apply.</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserSignup;
