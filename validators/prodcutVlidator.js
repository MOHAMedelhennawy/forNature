// or ESM/TypeScript import
import Ajv from "ajv"
import getCategoryAndSubCatgeoryMap from '../utils/categoryAndSubCategoryMap.js'

export default async function validateProduct(params) {
    console.log(params)
    const ajv = new Ajv({ allErrors: true, async: true }); // options can be passed, e.g. {allErrors: true}

    const categorySubCategoryMap = await getCategoryAndSubCatgeoryMap();

    ajv.addKeyword({
        keyword: 'isValidCategory',
        validate: async function(schema, data, parentData, parentDataPath) {
            /**
             * @param {any} schema - Represents the value associated with the custom keyword (`isValidCategory`) 
             *                       in the schema definition.
             * 
             * @param {any} data - The actual data being validated against the schema. 
             *                     Example: `'Dining'` (a category name submitted in the request).
             * 
             * @param {Object} parentData - The parent object or array containing the `data` being validated. 
             *                              Example: If validating `category` in `{ category: 'Dining', subCategory: 'Tables' }`,
             *                              `parentData` would be `{ category: 'Dining', subCategory: 'Tables' }`.
             * 
             * @param {string} parentDataPath - The JSON pointer (path) to the parent data. It represents the location of 
             *                                  `parentData` in the entire request body. 
             *                                  Example: `""` for the root, or `/nestedProperty` if `data` is within a nested object.
             *
             * @returns {boolean} - `true` if the validation passes; `false` otherwise. If the validation fails and `errors: true`
             *                      is enabled, you can define custom error messages.
             */

            return categorySubCategoryMap.has(data);
        },
        errors: false,
    });

    ajv.addKeyword({
        keyword: 'isValidSubCategory',
        validate: function (schema, data, parentData, parentDataPath) {
            const category = parentDataPath?.parentData?.category_id;  // Ensure that category exists

            if (!category || !categorySubCategoryMap.has(category)) {   // Ensure that category is not undefined, or it's not defined in database
                return false;
            }

            const subCategories = categorySubCategoryMap.get(category); // Get subCategories Array
            return subCategories.includes(data);    // Check if that sub category exists
        }
    })

    ajv.addKeyword({
        keyword: 'quantityIsNumber',
        validate: function (schema, data){

            if (isNaN(data) || data <= 0) { // Check if quantity is a number and more than 0
                return false
            }

            return true;
        },
        errors: false
    })

    ajv.addKeyword({
        keyword: 'priceIsFloat',
        validate: function (schema, data){

            if (isNaN(data) || data <= 0) { // Check if price is a number and more than 0
                return false
            }

            return true;
        },
        errors: false
    })

    const schema =  {
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

    }

    const validate = ajv.compile(schema);
    const isValid = await validate(params);

    return {
        isValid,
        errors: isValid ? null : validate.errors
    }
}