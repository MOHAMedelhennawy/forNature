import Ajv from 'ajv';
import validator from 'validator';
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
        image: { type: "string" },
        username: {
            type: "string",
            pattern: '^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$',
            errorMessage: 'Username must be 8-20 characters long and cannot have special characters at the beginning or end.',
        },
        first_name: {
            type: "string",
            minLength: 5,
            maxLength: 20,
            errorMessage: {
                minLength: 'must be at least 5 characters.',
                maxLength: 'cannot be more than 20 characters.',
            }
        },
        last_name: {
            type: "string",
            minLength: 5,
            maxLength: 20,
            errorMessage: {
                minLength: 'must be at least 5 characters.',
                maxLength: 'cannot be more than 20 characters.',
            }
        },
        email: {
            type: "string",
            format: 'email-validator',
            errorMessage: 'Invalid email format.',
        },
        password: {
            type: "string",
            pattern: '^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*!@$%^&(){}:;<>,.?/~_+-=|])[A-Za-z0-9*!@$%^&(){}:;<>,.?/~_+-=|0-9]{8,32}$',
            errorMessage: 'Choose a strong password',
        },
        phone_number: {
            type: "string",
            errorMessage: 'Phone number is required.',
        },
        isAdmin: { 
            type: "boolean" 
        }
    },
    required: ["username", "first_name", "last_name", "email", "password", "phone_number"],
    additionalProperties: false,
    errorMessage: {
        required: {
            username: 'Username is required.',
            first_name: 'First name is required.',
            last_name: 'Last name is required.',
            email: 'Email is required.',
            password: 'Password is required.',
            phone_number: 'Phone number is required.'
        },
        additionalProperties: 'No additional properties are allowed.',
    }
};

export default ajv.compile(schema);
