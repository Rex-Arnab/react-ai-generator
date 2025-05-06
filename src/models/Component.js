// models/Component.js
import mongoose from 'mongoose';

const ComponentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for this component.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
        // Simple slugification for uniqueness, consider a library for complex cases
        set: (v) => v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    },
    prompt: {
        type: String,
        required: false, // Original prompt might be useful
    },
    code: {
        type: String,
        required: [true, 'Please provide the component code.'],
    },
    libraries: { // Store specified libraries/CDNs
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } // Automatically manage timestamps
});

// Ensure unique names if needed, but careful with updates
ComponentSchema.index({ name: 1 }, { unique: true });

// Prevent model recompilation in Next.js dev environment
export default mongoose.models.Component || mongoose.model('Component', ComponentSchema);