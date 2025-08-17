const User = require('../../models/user');
const bcrypt = require("bcrypt");

// Get all users
const index = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
        });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new user
const store = async (req, res) => {
    const { username, token } = req.body;
    try {
        const [newUser, created] = await User.findOrCreate({
            where: { user_name: username },
            defaults: {token},
        });
        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, message: 'Email is already in use' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const destroy = async (req, res) => {
    try {
        await User.destroy({
            where: {
                id: req.params.id,
            },
        });
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const update = async (req, res) => {
    try {


        const updateData = {
            name: req.body.name,
            role_id: req.body.role_id
        };
        const updatedUser = await User.update(
            updateData,
            {
                where: {
                    id: req.params.id,
                },
            },
        );
        res.status(201).json({ success: true, data: updatedUser });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, message: 'Email is already in use' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    index,
    store,
    destroy,
    update,
};