import validator from 'validator'
import Ajv from 'ajv';

const ajv = new Ajv();

ajv.addFormat('email-validator', {
    type: 'string',
    validate: (email) => validator.isEmail(email),
});

const schema = {
    type: "object",
    properties: {
        image: {type: "string"},
        username: {
            type: "string",
            pattern: '^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$',
        },
        first_name: {
            type: "string",
            minLength: 5,
            maxLength: 20
        },
        last_name: {
            type: "string",
            minLength: 5,
            maxLength: 20
        },
        email: {
            type: "string",
            format: 'email-validator'
        },
        password: {
            type: "string"
        },
        phone_number: {type: "integer"},
        isAdmin: {type: "boolean"}
    },
    required: ["username", "first_name", "last_name", "email", "password", "phone_number"],
    additionalProperties: false,
}

export default ajv.compile(schema);
