export const getDepartureTime = () => {
    /*base10 integer */
    const hour = parseInt(process.env.DEPARTURE_TIME_HOUR || '12', 10);
    const today = new Date();
    today.setHours(hour, 0, 0, 0);
    return today;
};

export const getCancellationCutoff = () => {
    const departureTime = getDepartureTime();
    const cutoff = new Date(departureTime);
    cutoff.setHours(cutoff.getHours() - 2); // 2 hours before departure
    return cutoff;
};

export const canTrackNow = () => {
    const now = new Date();
    const departureTime = getDepartureTime();
    return now >= departureTime;
};

export const canCancelNow = () => {
    const now = new Date();
    const cutoff = getCancellationCutoff();
    return now < cutoff;
};
