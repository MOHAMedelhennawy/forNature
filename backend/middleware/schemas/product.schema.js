const schema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            minLength: 5,
            maxLength: 20,
        },
        category_id: {
            type: 'string',
            isValidCategory: true,
        },
        subCategory_id: {
            type: 'string',
            isValidSubCategory: true
        },
        description: {
            type: 'string',
            minLength: 10,
            maxLength: 2000,
        },
        summary: {
            type: 'string',
            minLength: 10,
            maxLength: 100,

        },
        price: {
            type: 'string',
            priceIsFloat: true,
        },
        quantity: {
            type: 'string',
            quantityIsNumber: true,
        },
    },
    required: ['name', 'category_id', 'subCategory_id', 'description', 'summary', 'price', 'quantity'],
    additionalProperties: false,
};

export const productSchemaPost = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            minLength: 5,
            maxLength: 20,
        },
        category_id: {
            type: 'string',
            isValidCategory: true,
        },
        subCategory_id: {
            type: 'string',
            isValidSubCategory: true
        },
        description: {
            type: 'string',
            minLength: 10,
            maxLength: 2000,
        },
        summary: {
            type: 'string',
            minLength: 10,
            maxLength: 100,

        },
        price: {
            type: 'string',
            priceIsFloat: true,
        },
        quantity: {
            type: 'string',
            quantityIsNumber: true,
        },
    },
    required: ['name', 'category_id', 'subCategory_id', 'description', 'summary', 'price', 'quantity'],
    additionalProperties: false,
};

export const productSchemaPut = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            minLength: 5,
            maxLength: 20,
        },
        category_id: {
            type: 'string',
            isValidCategory: true,
        },
        subCategory_id: {
            type: 'string',
            isValidSubCategory: true
        },
        description: {
            type: 'string',
            minLength: 10,
            maxLength: 2000,
        },
        summary: {
            type: 'string',
            minLength: 10,
            maxLength: 100,

        },
        price: {
            type: 'string',
            priceIsFloat: true,
        },
        quantity: {
            type: 'string',
            quantityIsNumber: true,
        },
    },
    additionalProperties: false,
};

export default schema;