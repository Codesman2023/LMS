import mongoose from 'mongoose';

const SupportSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
    status: {
        type: String,
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Support || mongoose.model('Support', SupportSchema);
