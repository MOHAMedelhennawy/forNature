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
        email: {
            type: "string",
            format: 'email-validator'
        },
        password: {
            type: "string",
            // pattern: '^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[]:;<>,.?/~_+-=|\]).{8,32}$'
        },
    },
    required: ["email", "password"],
    additionalProperties: false,
}

export default ajv.compile(schema);
