import Ajv from 'ajv';
import validator from 'validator'
import ajvErrors from 'ajv-errors';


const ajv = new Ajv({ allErrors: true, jsonPointers: true });
ajvErrors(ajv);

ajv.addFormat('email-validator', {
    type: 'string',
    validate: (email) => validator.isEmail(email),
});

const schema = {
    type: "object",
    properties: {
        email: {
            type: "string",
            format: 'email-validator',
            errorMessage: 'Invalid email format.',
        },
        password: {
            type: "string",
        },
    },
    required: ["email", "password"],
    additionalProperties: false,
}

export default ajv.compile(schema);
