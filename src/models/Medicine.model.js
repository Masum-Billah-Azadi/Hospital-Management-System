import mongoose from 'mongoose';

const MedicineSchema = new mongoose.Schema({
    //Medicine Name
    brandName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    //TYPE of the medicine
    dosageForm: {
        type: String,
        trim: true,
    },
    //Generic Name
    genericName: {
        type: String,
        trim: true,
    },
    //Strength of the medicine
    strength: {
        type: String,
        trim: true,
    },
    //Price of the medicine
    packageContainer: {
        type: String,
        trim: true,
    },
    //Brand Manufacturer
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