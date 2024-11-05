import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const __dirname = path.resolve('.');
const prisma = new PrismaClient();
const imagesDir = path.join(__dirname, 'public', 'images');

// List of categories and subcategories from the image
const categoriesData = [
    {
        name: 'Living Room',
        subCategories: [
            'Sofas', 'Corners L Shape', 'Corners U Shape', 'Sofa Beds', 'Chairs',
            'Side tables', 'Poufs', 'Banquettes', 'Chaise Lounges', 'Coffee Tables',
            'Consoles', 'Recliners', 'High Chairs', 'Living Room Sets', 'TV Units', 
            'Curtains', 'Cushions'
        ]
    },
    {
        name: 'Bedroom',
        subCategories: [
            'Beds', 'Wardrobes', 'Dressing tables', 'Bedside Tables', 'Bedroom sets',
            'Pillows', 'Bedding Accessories', 'Bedding Essentials', 'Mattresses', 
            'Hangers', 'Curtains'
        ]
    },
    {
        name: 'Dining',
        subCategories: ['Dining Rooms', 'Dining Tables', 'Dining Chairs', 'Buffets', 'Curtains']
    },
    {
        name: 'Bathroom',
        subCategories: [
            'Bathroom Cabinets', 'Bathroom Storage Units', 'Bathroom Accessories',
            'Bathroom Mirrors', 'Bathroom Robes', 'Bathroom Towels', 'Bathroom Mats'
        ]
    },
    {
        name: 'Kitchen',
        subCategories: ['Kitchens', 'Kitchen Tools & Accessories']
    },
    {
        name: 'Storage Unit',
        subCategories: [
            'Shoe Cabinets', 'Coffee Corners', 'Drawer Units', 'Bookcases', 'Shelves', 
            'Storage units'
        ]
    },
    {
        name: 'Outdoor Furniture',
        subCategories: ['Bean Bags', 'Garden Furniture', 'Beach Mat', 'Swings']
    }
];

function getRandomImage() {
    const images = fs.readdirSync(imagesDir);
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
}

async function createFakeProduct(subCategoryId) {
    return prisma.product.create({
        data: {
            name: faker.commerce.productName(),
            image: getRandomImage(),
            description: faker.commerce.productDescription(),
            summary: faker.lorem.sentence(),
            price: parseFloat(faker.commerce.price()),
            quantity: faker.number.int({ min: 1, max: 100 }),
            subCategory_id: subCategoryId,
        },
    });
}

async function generateFakeData() {
    // Clear existing data
    await prisma.product.deleteMany();
    await prisma.subCategory.deleteMany();
    await prisma.category.deleteMany();

    // Add new data from categoriesData
    for (const categoryData of categoriesData) {
        const category = await prisma.category.create({
            data: {
                name: categoryData.name,
                description: faker.lorem.sentence(),
                subCategories: {
                    create: categoryData.subCategories.map((subCategory) => ({
                        name: subCategory,
                    })),
                },
            },
            include: { subCategories: true },
        });

        // Create products for each subcategory in the category
        for (const subCategory of category.subCategories) {
            for (let i = 0; i < 100; i++) {
                await createFakeProduct(subCategory.id);
            }
        }
    }

    console.log("Fake data created successfully!");
}

generateFakeData()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
