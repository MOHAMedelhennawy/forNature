import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()
const models = {
    'user': prisma.User,
    'address': prisma.Address,
    'city': prisma.City,
    'state': prisma.State,
}

export const getAllData = async (model, limit) => {
    model = checkModel(model);

    try {
        const data = await model.findMany({
            take: limit,
        });
        return data;
    } catch(error) {
        throw new Error(`Failed to get data: ${error.message}`);
    }
}

export const getDataByID = async (model, id) => {
    model = checkModel(model);

    if (id) {
        try {
            const data = await model.findUnique({
                where: {id: id}
            })

            return data;
        } catch(error) {
            throw new Error(`Failed to get data: ${error.message};`)
        }
    } else {
        throw new Error("Id is missing")
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

    if (id) {
        try {
            return await model.update({
                where: {id: id},
                data: {
                    ...info,
                    updated_at: new Date()
                }
            })
        } catch(error) {
            throw new Error(`Failed to update data: ${error.message}`);
        }
    } else {
        throw new Error(`Id is missing`);
    }
}

export const deleteDataByID = async (model, id) => {
    model = checkModel(model);

    if (id) {
        try {
            return await model.delete({
                where: {id: id},
            })
        } catch(error) {
            throw new Error(`Failed to delete data: ${error.message}`);
        }
    } else {
        throw new Error(`Id is missing`);
    }
}

export const clearData = async (model) => {
    model = checkModel(model);
    console.log(model)
    try {
        await model.deleteMany({});
        console.log('Data cleared successfully');
    } catch (error) {
        console.error('Error during deletion:', error.message);
        throw new Error(`Failed to clear data: ${error.message}`);
    }
}

const checkModel = (model) => {
    if (!models[model]) {
        throw new Error(`${model} is an invalid model`)
    }

    return models[model];
}