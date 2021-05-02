const mongoose = require("mongoose"),
    bcrypt = require("bcrypt");

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: { unique: true },
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

async function generateHash(password) {
    const COST = 12;
    return bcrypt.hash(password, COST);
}

UserSchema.pre("save", function preSave(next) {
    const user = this;

    if (user.isModified("password")) {
        return generateHash(user.password)
            .then(hash => {
                user.password = hash;
                return next();
            }).catch(error => {
                return next(error);
            });
    }
    return next();
});

UserSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
    return bcrypt.compare(condidatePassword, this.password);
}

module.exports = mongoose.model("User", UserSchema);