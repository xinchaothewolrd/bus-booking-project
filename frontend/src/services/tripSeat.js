import api from "./api"

export const getSeatByTripId = (tripId) => {
    return api.get(`/trip-seats/trip/${tripId}`)
}

export const holdSeat = ({tripId, seatNumber}) => {
    return api.post('/trip-seats/hold', {tripId, seatNumber})
}