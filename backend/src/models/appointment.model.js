import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
	// Start and end times; end must be within 60 minutes of start
	startTime: { type: Date, required: true },
	endTime: { type: Date, required: true },
	status: {
		type: String,
		enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
		default: 'Scheduled'
	},
	type: {
		type: String,
		enum: ['Video'],
		default: 'Video'
	},
	// Video call metadata
	videoProvider: { type: String, default: 'internal' },
	videoRoomId: { type: String, default: '' },
	// Post-call artifacts (doctor -> patient)
	prescription: { type: String, trim: true, default: '' },
	extraAdvice: { type: String, trim: true, default: '' },
	// Post-call feedback (patient -> doctor)
	feedbackRating: { type: Number, min: 1, max: 5 },
	feedbackComment: { type: String, trim: true, default: '' }
}, { timestamps: true });

// Default endTime to 60 minutes after startTime if not provided
appointmentSchema.pre('validate', function (next) {
	if (this.startTime && !this.endTime) {
		this.endTime = new Date(this.startTime.getTime() + 60 * 60 * 1000);
	}
	return next();
});

// Ensure appointment duration is at most 60 minutes
appointmentSchema.path('endTime').validate(function (value) {
	if (!this.startTime || !value) return true;
	const durationMs = value.getTime() - this.startTime.getTime();
	return durationMs > 0 && durationMs <= 60 * 60 * 1000;
}, 'Appointment duration must be > 0 and at most 60 minutes.');

// Helpful indexes for querying and soft-conflict detection
appointmentSchema.index({ doctor: 1, startTime: 1 });
appointmentSchema.index({ user: 1, startTime: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;


