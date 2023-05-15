require('dotenv').config();
const supertest = require('supertest');
const fs = require('mz/fs');
const createServer = require('../server')

let app;

describe("init", () => {
    beforeAll(async () => {
        app = await createServer();
    });

    describe("Test with image", () => {

        let publicKey;
        let privateKey;

        describe("upload image", () => {
            const filePath = `${__dirname}/testFiles/Picture16.png`;
            it('should return public and private keys', async () => {
                const exists = await fs.exists(filePath);
                if (!exists) throw new Error('file does not exist');
                const response = await supertest(app).post('/files').attach('file', filePath);
                expect(response?.body?.message?.publicKey).toBeTruthy();
                expect(response?.body?.message?.privateKey).toBeTruthy();
                publicKey = response?.body?.message?.publicKey;
                privateKey = response?.body?.message?.privateKey;
            });
        })

        describe("get image from valid public key", () => {
            it("should return image in response body", async () => {
                const response = await supertest(app).get(`/files/${publicKey}`);
                expect(response?.body).toBeTruthy();
            });
        });

        describe("delete image with valid private key", () => {
            it("should return message 'File deleted successfully.'", async () => {
                const response = await supertest(app).delete(`/files/${privateKey}`);
                expect(response?.body?.message).toBe('File deleted successfully.');
            });
        });
    });

    describe("get image from invalid public key", () => {
        it("should return 500", async () => {
            const publicKey = 'jskjdka';
            const response = await supertest(app).get(`/files/${publicKey}`);
            expect(response?.statusCode).toBe(500)
        });
    });

    describe("delete image with invalid private key", () => {
        it("should return 500", async () => {
            const privateKey = 'jskjdka';
            const response = await supertest(app).delete(`/files/${privateKey}`);
            expect(response?.statusCode).toBe(500)
        });
    });
});
