import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import jwt from 'jsonwebtoken';
import request from 'supertest';

declare global {
    namespace NodeJS {
        interface Global {
            getCookie(): string[];
        }
    }
}


jest.mock('../nats-wrapper');


global.getCookie = () => {

    const id = new mongoose.Types.ObjectId().toHexString();
    const payload = {
        id,
        email: 'bao@bao.com'
    };

    const token = jwt.sign(payload, process.env.JWT_KEY!);

    const session = { jwt: token };

    const sessionJSON = JSON.stringify(session);

    const base64 = Buffer.from(sessionJSON).toString('base64');

    return [`express:sess=${base64}`];
};


let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'something';
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});