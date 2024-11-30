import { getCategoryAndSubCatgeory } from "../services/categoryService.js";

export default async function getCategoryAndSubCatgeoryMap() {
    const categorySubCategoryList = await getCategoryAndSubCatgeory();
    const categorySubCategoryMap = new Map();
    
    categorySubCategoryList.forEach(category => {
        const subCategoriesList = [];

        category.subCategories.forEach(subCategory => {
            subCategoriesList.push(subCategory.id);
        })

        categorySubCategoryMap.set(category.id, subCategoriesList);
    });

    return categorySubCategoryMap;
}