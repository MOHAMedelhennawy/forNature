import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient()
const models = {
    'user': prisma.User,
    'address': prisma.Address,
    'city': prisma.City,
    'state': prisma.State,
    'product': prisma.Product,
    'cart': prisma.Cart,
    'cartItem': prisma.CartItems,
    'wishlist': prisma.Wishlist,
}

export const getAllData = async (model, page, limit) => {
    try {
        model = checkModel(model);

        const queryOptions = (page && limit && !isNaN(page) && !isNaN(limit)) ? {
            skip: (page - 1) * limit,
            take: limit
        } : {};
        
        const data = await model.findMany(queryOptions);
        return data;
    } catch(error) {
        throw new Error(`Failed to get data: ${error.message}`);
    }
}

export const getDataByID = async (model, id) => {
    
    model = checkModel(model);
    if (!id) throw new Error(`Id is missing`);

    try {
        const data = await model.findUnique({
            where: {id}
        })

        return data;
    } catch(error) {
        throw new Error(`Failed to get data: ${error.message};`)
    }
}

export const createData = async (model, info) => {
    model = checkModel(model);

    try {
        const data = await model.create({
            data: info
        });

        return data;
    } catch(error) {
        throw new Error(`Failed to create data: ${error.message}`);
    }
}

export const updateDataByID = async (model, id, info) => {
    model = checkModel(model);

    if (!id) throw new Error(`Id is missing`);

    try {
        return await model.update({
            where: {id},
            data: {
                ...info,
                updated_at: new Date()
            }
        })
    } catch(error) {
        throw new Error(`Failed to update data: ${error.message}`);
    }
}

export const deleteDataByID = async (model, id) => {
    model = checkModel(model);

    if (!id) throw new Error(`Id is missing`);

    try {
        return await model.delete({ where: {id} })
    } catch(error) {
        throw new Error(`Failed to delete data: ${error.message}`);
    }
}

export const clearData = async (model) => {
    model = checkModel(model);
    console.log(model)
    try {
        await model.deleteMany({});
        logger.info('Data cleared successfully');
    } catch (error) {
        console.error('Error during deletion:', error.message);
        throw new Error(`Failed to clear data: ${error.message}`);
    }
}

export const getTotalItems = async (model) => {
    try {
        model = checkModel(model);

        return await model.count();
    } catch (error) {
        next(error);
    }

}
const checkModel = (model) => {
    if (!models[model]) {
        throw new Error(`${model} is an invalid model`)
    }

    return models[model];
}