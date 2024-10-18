import Ajv from 'ajv';

const ajv = new Ajv();

const schema = {
    type: "object",
    properties: {
        image: {type: "string"},
        username: {type: "string"},
        first_name: {type: "string"},
        last_name: {type: "string"},
        email: {type: "string"},
        password: {type: "string"},
        phone_number: {type: "integer"},
    },
    required: ["username", "first_name", "last_name", "email", "password", "phone_number"],
    additionalProperties: false,
}

let validators = ajv.compile(schema);
export const userValidator = (req, res, next) => {
    const valid = validators(req.body);

    if (!valid) {
        return res.status(400).json({ message: 'Validation failed: invalid input' });
    }

    next();
}