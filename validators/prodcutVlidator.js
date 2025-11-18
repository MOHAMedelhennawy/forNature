import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import getCategoryAndSubCatgeoryMap from '../utils/categoryAndSubCategoryMap.js';
import schema from '../middleware/schemas/product.schema.js';

const ajv = new Ajv({ allErrors: true, async: true, jsonPointers: true });
ajvErrors(ajv);

ajv.addKeyword({
    keyword: 'quantityIsNumber',
    validate: function (schema, data) {
        if (isNaN(data) || data <= 0) {
            return false;
        }
        return true;
    },
    errors: false,
});

ajv.addKeyword({
    keyword: 'priceIsFloat',
    validate: function (schema, data) {
        if (isNaN(data) || data <= 0) {
            return false;
        }
        return true;
    },
    errors: false,
});

export default async function validateProduct(data) {
    const categorySubCategoryMap = await getCategoryAndSubCatgeoryMap();

    // Add async keywords that depend on category map (using closure)
    ajv.addKeyword({
        keyword: 'isValidCategory',
        validate: async function (schema, data) {
            return categorySubCategoryMap.has(data);
        },
        errors: false,
    });

    ajv.addKeyword({
        keyword: 'isValidSubCategory',
        validate: function (schema, data, parentSchema, parentData) {
            const category = parentData?.category_id;

            if (!category || !categorySubCategoryMap.has(category)) {
                return false;
            }

            const subCategories = categorySubCategoryMap.get(category);
            return subCategories.includes(data);
        },
        errors: false,
    });

    const validate = ajv.compile(schema);
    const isValid = await validate(data);

    return isValid ? true : validate.errors;
}