import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const __dirname = path.resolve('.');
const prisma = new PrismaClient();
const imagesDir = path.join(__dirname, 'public', 'images/products');

const categoriesData = [
    {
        name: 'Living Room',
        subCategories: [
            'Sofas', 'Corners L Shape', 'Corners U Shape', 'Sofa Beds', 'Chairs',
            'Side tables', 'Poufs', 'Banquettes', 'Chaise Lounges', 'Coffee Tables',
            'Consoles', 'Recliners', 'High Chairs', 'Living Room Sets', 'TV Units',
            'Curtains', 'Cushions',
        ],
    },
    {
        name: 'Bedroom',
        subCategories: [
            'Beds', 'Wardrobes', 'Dressing tables', 'Bedside Tables', 'Bedroom sets',
            'Pillows', 'Bedding Accessories', 'Bedding Essentials', 'Mattresses',
            'Hangers', 'Curtains',
        ],
    },
    {
        name: 'Dining',
        subCategories: ['Dining Rooms', 'Dining Tables', 'Dining Chairs', 'Buffets', 'Curtains'],
    },
    {
        name: 'Bathroom',
        subCategories: [
            'Bathroom Cabinets', 'Bathroom Storage Units', 'Bathroom Accessories',
            'Bathroom Mirrors', 'Bathroom Robes', 'Bathroom Towels', 'Bathroom Mats',
        ],
    },
    {
        name: 'Kitchen',
        subCategories: ['Kitchens', 'Kitchen Tools & Accessories'],
    },
    {
        name: 'Storage Unit',
        subCategories: [
            'Shoe Cabinets', 'Coffee Corners', 'Drawer Units', 'Bookcases', 'Shelves',
            'Storage units',
        ],
    },
    {
        name: 'Outdoor Furniture',
        subCategories: ['Bean Bags', 'Garden Furniture', 'Beach Mat', 'Swings'],
    },
];

function getRandomImage() {
    const images = fs.readdirSync(imagesDir);
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
}

async function createFakeProduct(subCategoryId, categoryId) {
    return prisma.product.create({
        data: {
            name: faker.commerce.productName().slice(0, 20),
            image: getRandomImage().slice(0, 80),
            description: faker.commerce.productDescription().slice(0, 2000),
            summary: faker.lorem.sentence().slice(0, 100),
            price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
            quantity: faker.number.int({ min: 1, max: 100 }),
            subCategory_id: subCategoryId,
            category_id: categoryId,
        },
    });
}

async function generateFakeData() {
    console.log("Clearing existing data...");
    await prisma.product.deleteMany();
    await prisma.subCategory.deleteMany();
    await prisma.category.deleteMany();

    console.log("Adding new data...");
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

        for (const subCategory of category.subCategories) {
            for (let i = 0; i < 10; i++) {
                await createFakeProduct(subCategory.id, category.id);
            }
        }
    }

    console.log("Fake data created successfully!");
}

generateFakeData()
    .catch((e) => {
        console.error("Error while generating fake data:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
