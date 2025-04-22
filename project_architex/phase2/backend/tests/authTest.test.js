const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');

describe('Auth API', () => {
    beforeAll(async () => {
        // Clear users collection
        await User.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.success).toBe(true);
        });

        it('should validate required fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: '',
                    email: 'invalid-email',
                    password: '123'
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('should not register user with existing email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Another User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('msg', 'User already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login a user and return a token', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('user');
            expect(res.body.success).toBe(true);
        });

        it('should not login with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('msg', 'Invalid credentials');
        });
    });

    describe('GET /api/auth/me', () => {
        let token;

        beforeAll(async () => {
            // Login to get a token
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            token = res.body.token;
        });

        it('should get current user profile', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', 'Test User');
            expect(res.body).toHaveProperty('email', 'test@example.com');
        });

        it('should not allow access without token', async () => {
            const res = await request(app).get('/api/auth/me');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
});