import React, { useState, useRef } from 'react';
import { mapsApi } from '../services/mapsService';

const LocationSearch = ({
    placeholder,
    value,
    onSelect,
    icon,
}) => {
    const [ query, setQuery ] = useState(value || '');
    const [ results, setResults ] = useState([]);
    const [ open, setOpen ] = useState(false);
    const [ loading, setLoading ] = useState(false);
    const debounceRef = useRef(null);

    const handleChange = (e) => {
        const q = e.target.value;
        setQuery(q);
        setOpen(true);

        clearTimeout(debounceRef.current);
        if (q.length < 3) {
            setResults([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await mapsApi.geocode(q);
                setResults(data);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 400);
    };

    const handleSelect = (location) => {
        setQuery(location.name);
        setOpen(false);
        onSelect(location);
    };

    return (
        <div className="relative">
            <div className="flex items-center bg-white rounded-lg shadow px-3 py-2">
                {icon}
                <input
                    className="w-full outline-none text-sm ml-2"
                    type="text"
                    placeholder={placeholder}
                    value={query || value}
                    onChange={handleChange}
                    onFocus={() => setOpen(results.length > 0)}
                />
            </div>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    {loading && (
                        <div className="px-4 py-2 text-sm text-gray-500">Searching...</div>
                    )}
                    {!loading && results.length === 0 && query.length >= 3 && (
                        <div className="px-4 py-2 text-sm text-gray-500">No results found</div>
                    )}
                    {results.map((result, idx) => (
                        <button
                            key={idx}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100"
                            onClick={() => handleSelect(result)}
                        >
                            {result.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LocationSearch;
