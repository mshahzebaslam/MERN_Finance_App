import mongoose from 'mongoose';
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    balance:{
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: true
    },
    accounts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    }],
    tokens: [{
        token: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// const User = mongoose.model('User', UserSchema);    
// export default User;

export default mongoose.models.User || mongoose.model('User', UserSchema);
