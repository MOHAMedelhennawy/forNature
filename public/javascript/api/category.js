export async function fetchCategories() {
    try {
        const response = await fetch(`/api/v1/category`);

        if (!response.ok) {
            console.error('Failed to fetch category');
        }

        return await response.json();
    } catch (error) {
        console.error(error);
    }
}
