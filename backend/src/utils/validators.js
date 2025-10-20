// Add this helper function somewhere near the top of doctor.controller.js
// Or preferably in a separate utils/validators.js file and import it

const isValidTimeFormat = (time) => {
    // Basic HH:MM format check (00:00 to 23:59)
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};

// Helper to convert HH:MM to minutes since midnight
const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const validateAvailability = (availability) => {
    if (!Array.isArray(availability)) {
        return "Availability must be an array.";
    }

    const uniqueDays = new Set();
    for (const daySchedule of availability) {
        if (typeof daySchedule !== 'object' || daySchedule === null) {
            return "Each item in availability must be an object.";
        }

        const { dayOfWeek, slots } = daySchedule;

        // Validate dayOfWeek
        if (typeof dayOfWeek !== 'number' || dayOfWeek < 0 || dayOfWeek > 6) {
            return `Invalid dayOfWeek: ${dayOfWeek}. Must be a number between 0 (Sunday) and 6 (Saturday).`;
        }
        if (uniqueDays.has(dayOfWeek)) {
            return `Duplicate entry for dayOfWeek: ${dayOfWeek}. Each day should appear at most once.`;
        }
        uniqueDays.add(dayOfWeek);

        // Validate slots
        if (!Array.isArray(slots)) {
            return `Slots for day ${dayOfWeek} must be an array.`;
        }

        const sortedSlots = [];
        for (const slot of slots) {
            if (typeof slot !== 'object' || slot === null) {
                return `Each slot for day ${dayOfWeek} must be an object.`;
            }
            const { start, end } = slot;

            if (!start || !end) {
                return `Slots for day ${dayOfWeek} must have 'start' and 'end' properties.`;
            }
            if (!isValidTimeFormat(start) || !isValidTimeFormat(end)) {
                return `Invalid time format for day ${dayOfWeek}. Use HH:MM (e.g., "09:00", "17:30"). Found start: ${start}, end: ${end}.`;
            }

            const startMinutes = timeToMinutes(start);
            const endMinutes = timeToMinutes(end);

            if (startMinutes >= endMinutes) {
                return `Invalid slot for day ${dayOfWeek}: start time ${start} must be before end time ${end}.`;
            }
            sortedSlots.push({ start: startMinutes, end: endMinutes });
        }

        // Check for overlapping slots within the day
        sortedSlots.sort((a, b) => a.start - b.start); // Sort slots by start time
        for (let i = 0; i < sortedSlots.length - 1; i++) {
            if (sortedSlots[i].end > sortedSlots[i + 1].start) {
                const overlapStart = new Date(0);
                overlapStart.setMinutes(sortedSlots[i + 1].start);
                const overlapEnd = new Date(0);
                overlapEnd.setMinutes(sortedSlots[i].end);
                return `Overlapping slots detected for day ${dayOfWeek} between ${overlapStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} and ${overlapEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
            }
        }
    }

    // If all checks pass
    return null; // Indicates no errors
};

export{validateAvailability,isValidTimeFormat,timeToMinutes};