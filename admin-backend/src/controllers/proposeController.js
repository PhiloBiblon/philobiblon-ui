const Propose = require("../../models/propose");
const pusher = require("../../config/pusher");
const User = require("../../models/user");
const index = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            item_id: req.body.item_id,
            fingerprint: req.body.fingerprint,
            created_at_order_type: req.query.created_at_order_type,
        };
        const propose = await Propose.findOne({
            attributes: ['id', 'item_id', 'fingerprint', 'status', 'approved', 'createdAt', 'user_id'],
            where: {
                ...(filters.status && { status: filters.status }),
                ...(filters.item_id && { item_id: filters.item_id }),
                ...(filters.fingerprint && { fingerprint: filters.fingerprint }),
            },
            order: [
                ...(filters.created_at_order_type ? [['createdAt', filters.created_at_order_type]] : [[ 'createdAt', 'ASC' ]]),
            ],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'user_name', 'token']
                }
            ]
        });
        // propose.token = req.user.token

        res.status(200).json({ type: 'success', propose, success: true});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}
const getAllProposes = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            item_id: req.body.item_id,
            fingerprint: req.body.fingerprint,
            created_at_order_type: req.query.created_at_order_type,
        };
        const propose = await Propose.findAll({
            attributes: ['id', 'item_id', 'fingerprint', 'status', 'approved', 'createdAt'],
            where: {
                ...(filters.status && { status: filters.status }),
                ...(filters.item_id && { item_id: filters.item_id }),
                ...(filters.fingerprint && { fingerprint: filters.fingerprint }),
            },
            order: [
                ...(filters.created_at_order_type ? [['createdAt', filters.created_at_order_type]] : [[ 'createdAt', 'ASC' ]]),
            ],
        });

        res.status(200).json({ type: 'success', propose , success: true});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}
const store = async (req, res) => {
    try {
        const data = {
            'item_id': req.body.item_id,
            'fingerprint': req.body.fingerprint,
            'approved': false,
        };
        const [propose, created] = await Propose.findOrCreate({
            where: { fingerprint: data.fingerprint, item_id: data.item_id },
            defaults: data,
        });
        if (!propose) {
            return res.status(404).json({ error: 'Something went wrong' });
        }
        await pusher.trigger("proposes", "ProposeCreated", {
            message: "A new proposal was created!",
        });
        res.status(200).json({ type: 'success', data: propose });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}
const update = async (req, res) => {
    try {
        const updateData = {
            approved: true,
            status: 'approved',
            user_id: req.user.id
        };
        const updatedPropose = await Propose.update(
            updateData,
            {
                where: {
                    id: req.params.id,
                },
                validate: false
            },
        );
        res.status(201).json({ success: true, data: updatedPropose });

    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
}
const destroy = async (req, res) => {
    try {
        await Propose.destroy({
            where: {
                id: req.params.id,
            },
        });
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
}

module.exports = {
    index,
    store,
    update,
    destroy,
    getAllProposes
};