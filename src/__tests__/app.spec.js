require('dotenv').config();
const supertest = require('supertest');
const fs = require('mz/fs');
const createServer = require('../server')

let app;

describe("init", () => {
    beforeAll(async () => {
        app = await createServer();
    });

    describe("upload image", () => {
        const filePath = `${__dirname}/testFiles/Picture16.png`;
        it('should upload the test file to storage', async () => {
            const exists = await fs.exists(filePath);
            if (!exists) throw new Error('file does not exist');
            const response = await supertest(app).post('/files').attach('file', filePath);

            const { publicKey, privateKey } = response?.message;
            describe("get image from valid public key", () => {
                it("should return 200", async () => {
                    return await supertest(app).get(`/files/${publicKey}`).expect(200);
                });
            });

            describe("delete image with valid private key", () => {
                it("should return 200", async () => {
                    return await supertest(app).delete(`/files/${privateKey}`).expect(200);
                });
            });
        });
    });

    describe("get image from invalid public key", () => {
        it("should return 500", async () => {
            const publicKey = 'jskjdka';
            return await supertest(app).get(`/files/${publicKey}`).expect(500);
        });
    });

    describe("delete image with invalid private key", () => {
        it("should return 500", async () => {
            const privateKey = 'jskjdka';
            return await supertest(app).delete(`/files/${privateKey}`).expect(500);
        });
    });
});
