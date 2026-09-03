import api from '../utils/api';

export const rideApi = {
    getFare: (pickupAddress, destinationAddress) =>
        api.get('/rides/fare', { data: { pickupAddress, destinationAddress } }),
    create: (pickupAddress, destinationAddress, vehicleType) =>
        api.post('/rides/create', { pickupAddress, destinationAddress, vehicleType }),
    getStatus: (rideId) => api.get(`/rides/${rideId}`),
    confirm: (rideId) => api.post('/rides/confirm', { rideId }),
    start: (rideId, otp) => api.post('/rides/start', { rideId, otp }),
    complete: (rideId) => api.post('/rides/complete', { rideId }),
    cancel: (rideId) => api.post('/rides/cancel', { rideId }),
    history: () => api.get('/rides/history'),
};
