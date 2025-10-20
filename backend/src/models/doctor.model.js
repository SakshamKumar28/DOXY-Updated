import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Subdocument for patient reviews
const reviewSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	rating: { type: Number, min: 1, max: 5, required: true },
	comment: { type: String, trim: true, default: '' },
	createdAt: { type: Date, default: Date.now }
}, { _id: false });

// Subdocument for weekly availability slots
const availabilitySlotSchema = new mongoose.Schema({
    dayOfWeek: { // 0-6, where 0 = Sunday
        type: Number,
        min: 0,
        max: 6,
        required: true
    },
    slots: [{ // e.g., [{ start: "09:00", end: "10:00" }, { start: "14:00", end: "15:00" }]
        start: { type: String, required: true },
        end: { type: String, required: true }
    }]
}, { _id: false });

const doctorSchema = mongoose.Schema({
	fullname:{
		type:String,
		required:[true,"Full name is required"],
		trim:true
	},
	phoneNumber:{
		type:String,
		required:[true,"Phone number is required"],
		unique:true,
		trim:true
	},
	age:{
		type:Number,
		required:[true,"Age is required"],
		min:[20,"Age must be atleast 20"]
	},
	email:{
		type:String,
		required:[true,"Email is required"],
		unique:true,
		trim:true,
		match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/,"Please enter a valid email address"]
	},
	password:{
		type:String,
		required:[true,"Password is required"],
		minlength:[8,"Password must be atleast 8 characters long"],
		select:false
	},
	accountVerified:{
		type:Boolean,
		default:false
	},
	verificationCode:{
		type:String,
		select:false,
		default:null
	},
	verificationExpiry:{
		type:Date,
		select:false,
		default:null
	},
	specialisation:{
		type:String,
		required:[true,"Specialisation is required"],
		trim:true,
		enum:["Cardiologist","Dermatologist","Endocrinologist","Gastroenterologist","Hematologist","Neurologist","Oncologist","Pediatrician","Psychiatrist","Rheumatologist","Urologist"]
	},
	experience:{
		type:Number,
		required:[true,"Experience is required"],
		min:[1,"Experience must be atleast 1 year"]
	},
	hospital:{
		type:String,
		required:[true,"Hospital is required"],
		trim:true
	},
	address:{
		type:String,
		trim:true,
		default:"",
		select:false
	},
	profilePicture:{
		type:String,
		default:"",
		select:false
	},
	isAvailable:{
		type:Boolean,
		default:true
	},
	// Aggregated rating info
	averageRating:{
		type:Number,
		min:0,
		max:5,
		default:0
	},
	ratingCount:{
		type:Number,
		min:0,
		default:0
	},
	// Patient reviews
	reviews:{
		type:[reviewSchema],
		default:[]
	},
	// Weekly availability schedule
	availability: {
        type: [availabilitySlotSchema],
        default: []
    },
	// Consultation fee in the provider's currency (e.g., INR)
	consultationFee:{
		type:Number,
		required:[true,"Consultation fee is required"],
		min:[0,"Consultation fee must be atleast 0"]
	}
}, { timestamps: true });

// Hash password before save if modified
doctorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

doctorSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;