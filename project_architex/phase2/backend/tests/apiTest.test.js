const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Style = require('../models/Style');

describe('Users API', () => {
    let token;
    let userId;
    let styleId;

    beforeAll(async () => {
        // Clear collections
        await User.deleteMany({});
        await Style.deleteMany({});

        // Register a test user
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'User Test',
                email: 'user-test@example.com',
                password: 'password123'
            });

        token = registerRes.body.token;

        // Get user ID
        const userRes = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        userId = userRes.body._id;

        // Create a test style
        const styleRes = await request(app)
            .post('/api/styles')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Modern Architecture',
                period: '20th Century',
                description: 'A style characterized by simplicity and function.',
                characteristics: ['Clean lines', 'Minimal ornamentation', 'Emphasis on function']
            });

        styleId = styleRes.body._id;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('GET /api/users/favorites', () => {
        it('should initially return empty favorites array', async () => {
            const res = await request(app)
                .get('/api/users/favorites')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });
    });

    describe('PUT /api/users/favorites/:styleId', () => {
        it('should add a style to favorites', async () => {
            const res = await request(app)
                .put(`/api/users/favorites/${styleId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('action', 'added');
            expect(res.body.favorites).toContain(styleId);
        });

        it('should remove a style from favorites when toggled again', async () => {
            // First add to favorites
            await request(app)
                .put(`/api/users/favorites/${styleId}`)
                .set('Authorization', `Bearer ${token}`);

            // Then toggle to remove
            const res = await request(app)
                .put(`/api/users/favorites/${styleId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('success', true);
        });

        it('should not toggle favorites without authentication', async () => {
            const res = await request(app)
                .put(`/api/users/favorites/${styleId}`);

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/users/favorites with added favorites', () => {
        beforeEach(async () => {
            // Add style to favorites
            await request(app)
                .put(`/api/users/favorites/${styleId}`)
                .set('Authorization', `Bearer ${token}`);
        });

        it('should return favorites with populated style data', async () => {
            const res = await request(app)
                .get('/api/users/favorites')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('GET /api/users', () => {
        it('should get all users when authenticated', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty('name', 'Test User');
        });

        it('should not allow access without authentication', async () => {
            const res = await request(app)
                .get('/api/users');

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/users/:id', () => {
        it('should get user by ID when authenticated', async () => {
            const res = await request(app)
                .get(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id', userId);
            expect(res.body).toHaveProperty('name', 'User Test');
            expect(res.body).toHaveProperty('email', 'user-test@example.com');
        });

        it('should not get user without authentication', async () => {
            const res = await request(app)
                .get(`/api/users/${userId}`);

            expect(res.status).toBe(401);
        });

        it('should return 404 for non-existent user', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/users/${nonExistentId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('msg', 'User not found');
        });
    });
});