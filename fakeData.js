#!/usr/bin/env node
import { createData } from './controller/base.js';

const data = {
    California: ["Los Angeles", "San Francisco", "San Diego", "Sacramento"],
    Texas: ["Houston", "Dallas", "Austin", "San Antonio"],
    NewYork: ["New York City", "Buffalo", "Rochester", "Albany"],
    Florida: ["Miami", "Orlando", "Tampa", "Jacksonville"],
    Illinois: ["Chicago", "Springfield", "Aurora", "Naperville"],
    Pennsylvania: ["Philadelphia", "Pittsburgh", "Harrisburg", "Allentown"],
    Ohio: ["Columbus", "Cleveland", "Cincinnati", "Toledo"],
    Michigan: ["Detroit", "Grand Rapids", "Ann Arbor", "Lansing"],
    Georgia: ["Atlanta", "Savannah", "Augusta", "Macon"],
    Arizona: ["Phoenix", "Tucson", "Mesa", "Scottsdale"]
};

// Create fake states and cities
const createFakeData = async () => {
    try {
        for (const [stateName, cities] of Object.entries(data)) {
            const stateObj = {
                name: stateName,
                postal_code: '432'
            };
            
            const state = await createData('state', stateObj);
            
            for (const cityName of cities) {
                const cityObj = {
                    name: cityName,
                    state_id: state.id
                };
                
                await createData('city', cityObj);
            }
        }
        console.log('Fake data created successfully');
    } catch (error) {
        console.error('Error creating fake data:', error.message);
    }
};

createFakeData();
