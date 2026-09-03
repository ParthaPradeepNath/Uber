import api from '../utils/api';

export const userApi = {
    register: (data) => api.post('/users/register', data),
    login: (data) => api.post('/users/login', data),
    logout: () => api.get('/users/logout'),
    getProfile: () => api.get('/users/profile'),
};

export const captainApi = {
    register: (data) => api.post('/captains/register', data),
    login: (data) => api.post('/captains/login', data),
    logout: () => api.get('/captains/logout'),
    getProfile: () => api.get('/captains/profile'),
    toggleStatus: () => api.patch('/captains/toggle-status'),
    updateLocation: (latitude, longitude) =>
        api.patch('/captains/update-location', { latitude, longitude }),
};
