// backend/models/skill.model.js
import { Schema, model } from 'mongoose';

const skillSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    skillName: {
        type: String,
        required: [true, 'Skill name is required'],
        trim: true,
        maxlength: [50, 'Skill name cannot exceed 50 characters']
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Intermediate'
    }
}, {
    timestamps: true
});

// Indexes for better performance
skillSchema.index({ userId: 1 });
skillSchema.index({ skillName: 1 });

// Compound index for unique skill per user
skillSchema.index({ userId: 1, skillName: 1 }, { unique: true });

// Middleware to automatically remove skill from user's skillsIds when skill is deleted
skillSchema.pre('findOneAndDelete', async function() {
    try {
        const skill = await this.model.findOne(this.getQuery());
        if (skill) {
            // Import User model to update skillsIds array
            const User = model('User');
            await User.findByIdAndUpdate(
                skill.userId,
                { $pull: { skillsIds: skill._id } }
            );
        }
    } catch (error) {
        console.error('Error removing skill from user skillsIds:', error);
    }
});

const Skill = model('Skill', skillSchema);
export default Skill;