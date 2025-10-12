import mongoose from 'mongoose';

const MedicineSchema = new mongoose.Schema({
    brandName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    dosageForm: {
        type: String,
        trim: true,
    },
    genericName: {
        type: String,
        trim: true,
    },
    strength: {
        type: String,
        trim: true,
    },
    packageContainer: {
        type: String,
        trim: true,
    },
    manufacturer: {
        type: String,
        trim: true,
    },
    indications: {
        type: String,
        trim: true,
        index: true
    },
});

export default mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);