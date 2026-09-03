import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CaptainLogin = () => {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ error, setError ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const { loginCaptain } = useAuth();
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await loginCaptain(email, password);
            navigate('/captain-home');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="p-7 h-screen flex flex-col justify-between">
                <div>
                    <img
                        className="w-20 mb-3"
                        src="https://www.svgrepo.com/show/505031/uber-driver.svg"
                        alt="Uber Driver Logo"
                    />
                    <form onSubmit={submitHandler}>
                        <h3 className="text-lg font-medium mb-2">What's your email</h3>
                        <input
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-[#eeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
                            type="email"
                            placeholder="email@example.com"
                        />

                        <h3 className="text-lg font-medium mb-2">Enter Password</h3>
                        <input
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-[#eeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
                            type="password"
                            placeholder="Password"
                        />

                        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

                        <button
                            disabled={loading}
                            className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 w-full text-lg disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    <p className="text-center">
                        Join a fleet?{' '}
                        <Link to="/captain-signup" className="text-blue-600">
                            Register as a Captain
                        </Link>
                    </p>
                </div>

                <div>
                    <Link
                        to="/login"
                        className="bg-[#f3c164] flex items-center justify-center text-white font-semibold mb-5 rounded px-4 py-2 w-full text-lg"
                    >
                        Sign in as User
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CaptainLogin;
