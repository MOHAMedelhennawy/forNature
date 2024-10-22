import { addNewUserHandler, getAllUsersHandler, getUserByIDHandler } from "../../../handlers/user.js";
import { createData, getAllData, getDataByID } from "../../../controller/base.js";
import exp from "constants";
import { checkEmail, checkUsername, generateAuthToken } from "../../../services/authService.js";
import { query } from "express";

// Mock the Prisma findUnique function
jest.mock("../../../controller/base.js");
jest.mock('../../../services/authService.js');

describe('Get users', () => {
    
    let mockRequest;
    let mockResponse;
    let mockNext;

    beforeEach(() => {
        // Initialize mockRequest, mockResponse, and mockNext before each test
        mockRequest = {
            params: {
                id: '6b9759e8-53eb-4f30-abf3-b7bdc715e99a'
            }
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockNext = jest.fn();
    });

    test('Get user by id - success: with status 200', async () => {
        const mockUserData = { id: '6b9759e8-53eb-4f30-abf3-b7bdc715e99a', name: 'Mohammed Elhennawy' };
        getDataByID.mockResolvedValue(mockUserData);

        await getUserByIDHandler(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(mockUserData);
        expect(mockNext).not.toHaveBeenCalled()
    });

    test('Get user by id - failure', async () => {
        const errorMessage = 'Failed to get data: Database error';
        getDataByID.mockRejectedValue(new Error(errorMessage));

        await getUserByIDHandler(mockRequest, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        expect(mockResponse.status).not.toHaveBeenCalled(); 
        expect(mockResponse.json).not.toHaveBeenCalled(); 
    });

    test('Get user by id - failure: without passing id', async () => {
        mockRequest.params = {};
        const errorMessage = { message: 'Invalid or missing ID' };

        await getUserByIDHandler(mockRequest, mockResponse, mockNext);
 
        expect(mockNext).not.toHaveBeenCalled();
        expect(getDataByID).not.toHaveBeenCalled()
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(errorMessage); 
    })

    test('Get user by id - faliure: Passing invalid id "number"', async () => {
        mockRequest = {
            params: {
                id: 34
            }
        };
        const errorMessage = { message: 'Invalid or missing ID' };


        await getUserByIDHandler(mockRequest, mockResponse, mockNext);

        expect(mockNext).not.toHaveBeenCalled()
        expect(getDataByID).not.toHaveBeenCalled()
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(errorMessage)
    })

    test('Get user by id - faliure: Passing invalid id "not uuid"', async () => {
        mockRequest.params.id = 'this is not uuid';

        const errorMessage = { message: 'Invalid or missing ID' };

        await getUserByIDHandler(mockRequest, mockResponse, mockNext);

        expect(mockNext).not.toHaveBeenCalled()
        expect(getDataByID).not.toHaveBeenCalled()
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(errorMessage)
    })

    test('Get user by id - faliure: returns no user', async () => {
        const errorMessage = { message: 'User not found' };

        getDataByID.mockResolvedValue(undefined);

        await getUserByIDHandler(mockRequest, mockResponse, mockNext);
        expect(mockNext).not.toHaveBeenCalled()
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith(errorMessage);
    })
});

describe('Create new user', () => {
    
    let mockRequest;
    let mockResponse;
    let mockNext;

    beforeEach(() => {
        mockRequest = {
            body: {
                image: "images/user.png",
                username: "MohammedElhennawy",
                first_name: "Mohammed",
                last_name: "Elhennawy",
                email: "Elhennawy@ex.com",
                password: "password",
                phone_number: 123353
            }
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            header: jest.fn().mockReturnThis(),
        };

        mockNext = jest.fn();
    });

    test('Create new user - success', async () => {
        const mockUserData = {
            id: "6b9759e8-53eb-4f30-abf3-b7bdc715e99a",
            created_at: "2024-10-18T20:27:49.612Z",
            updated_at: "2024-10-18T20:27:49.612Z",
            image: "images/user.png",
            username: "MohammedElhenawy",
            first_name: "Mohammed",
            last_name: "Elhennawy",
            email: "Elhennawy@ex.com",
            password: "$2b$10$Z8kCLGL0s6sc2MK1ecMJnO/96MCEvogB8Rqg/9jINvqS5bWgeP6Xe",
            phone_number: 123353
        }
        checkUsername.mockResolvedValue(undefined);
        checkEmail.mockResolvedValue(undefined);
        createData.mockResolvedValue(mockUserData);
        generateAuthToken.mockResolvedValue('userTOken')
        
        await addNewUserHandler(mockRequest, mockResponse, mockNext);
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockResponse.header).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(mockUserData);
        
    })

    test('Create new user - faliure: Username already exist', async () => {
        const errorMessage = { message: 'Username already exists' };
        checkUsername.mockResolvedValue({});
        checkEmail.mockResolvedValue(undefined);

        await addNewUserHandler(mockRequest, mockResponse, mockNext);
        expect(mockNext).not.toHaveBeenCalled()
        expect(mockResponse.json).toHaveBeenCalledWith(errorMessage);
        expect(mockResponse.status).toHaveBeenCalledWith(400);

    })

    test('Create new user - faliure: Email already exist', async () => {
        const errorMessage = { message: 'Email already exists' };
        checkUsername.mockResolvedValue(undefined);
        checkEmail.mockResolvedValue({});

        await addNewUserHandler(mockRequest, mockResponse, mockNext);
        expect(mockNext).not.toHaveBeenCalled()
        expect(mockResponse.json).toHaveBeenCalledWith(errorMessage);
        expect(mockResponse.status).toHaveBeenCalledWith(400);

    })

    test('Create new user - faliure: returns `undefiend`', async () => {
        const errorMessage = { message: `Failed to create user`}
        checkUsername.mockResolvedValue(undefined);
        checkEmail.mockResolvedValue(undefined);
        createData.mockResolvedValue(undefined);

        await addNewUserHandler(mockRequest, mockResponse, mockNext);
        expect(mockNext).not.toHaveBeenCalled()
        expect(mockResponse.json).toHaveBeenCalledWith(errorMessage);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
    })

    test('Create new user - faliure: Check username server error', async () => {
        const errorMessage = 'server error during check username';
        checkUsername.mockRejectedValue(new Error(errorMessage));

        await addNewUserHandler(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        expect(mockResponse.json).not.toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
    })

    test('Create new user - faliure: Check email server error', async () => {
        const errorMessage = 'server error during check email';
        checkEmail.mockRejectedValue(new Error(errorMessage));

        await addNewUserHandler(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        expect(mockResponse.json).not.toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
    })


})


describe('Get all users', () => {

    let mockRequest;
    let mockResponse;
    let mockNext;

    beforeEach(() => {
        mockRequest = {
            query: { limit: null }
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockNext = jest.fn();
    });

    test('Get all users - success', async () => {
        getAllData.mockResolvedValue({});

        await getAllUsersHandler(mockRequest, mockResponse, mockNext);
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockResponse.json).toHaveBeenCalledWith({});
        expect(mockResponse.status).toHaveBeenCalledWith(200);
    })

    test('Get all users - faliure: returns undefined', async () => {
        const errorMessage = { message: 'No users found' };
        getAllData.mockResolvedValue(undefined);

        await getAllUsersHandler(mockRequest, mockResponse, mockNext);
        expect(mockNext).not.toHaveBeenCalled()
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith(errorMessage);
    })

    test('Get all users - faliure: server error', async () => {
        const errorMessage = `Failed to get data`;
        getAllData.mockRejectedValue(new Error(errorMessage));

        await getAllUsersHandler(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
    })
})