const User = require('../../models/user');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const index = async (req, res) => {
    try {

        if (!req.user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ type: 'success', data: req.user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve user profile' });
    }
}

const login = async (req, res) => {
    const { username, accessToken } = req.body;

    try {
        // Check if the user exists
        const [user, created] = await User.findOrCreate({
            where: { user_name: username }
        });
        console.log(user);
        await user.update({token: accessToken.token})
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // // Compare passwords
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        // if (!isPasswordValid) {
        //     return res.status(400).json({ error: 'Invalid email or password' });
        // }

        // Generate JWT
        const token = jwt.sign({ id: user.id, user_name: user.user_name }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN??60*60,
        });

        res.status(200).json({ message: 'Login successful', token, user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to login' });
    }
}

const logout = (req, res) => {
    res.status(200).json({ message: "Logout successful", success: true });
}


module.exports = {
    index,
    login,
    logout
};