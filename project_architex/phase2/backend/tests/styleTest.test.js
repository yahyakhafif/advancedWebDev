const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Style = require('../models/Style');
const User = require('../models/User');

describe('Styles API', () => {
    let token;
    let userId;
    let styleId;

    beforeAll(async () => {
        // Clear collections
        await Style.deleteMany({});

        // Register a test user
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Style Test User',
                email: 'style-test@example.com',
                password: 'password123'
            });

        token = registerRes.body.token;

        // Get user ID
        const userRes = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        userId = userRes.body._id;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('POST /api/styles', () => {
        it('should create a new style when authenticated', async () => {
            const styleData = {
                name: 'Gothic Architecture',
                period: '12th-16th Century',
                description: 'Gothic architecture is a style that flourished in Europe during the High and Late Middle Ages.',
                characteristics: ['Pointed arches', 'Ribbed vaults', 'Flying buttresses'],
                mainFeatures: ['Tall spires', 'Large stained glass windows'],
                famousExamples: [
                    {
                        name: 'Notre-Dame Cathedral',
                        location: 'Paris, France',
                        architect: 'Unknown',
                        year: '1163-1345'
                    }
                ],
                imageUrl: 'https://example.com/gothic.jpg'
            };

            const res = await request(app)
                .post('/api/styles')
                .set('Authorization', `Bearer ${token}`)
                .send(styleData);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('name', 'Gothic Architecture');
            expect(res.body).toHaveProperty('createdBy', userId);

            // Save style ID for future tests
            styleId = res.body._id;
        });

        it('should not create style without authentication', async () => {
            const res = await request(app)
                .post('/api/styles')
                .send({
                    name: 'Renaissance',
                    period: '14th-17th Century',
                    description: 'Renaissance architecture.',
                    characteristics: ['Symmetry', 'Proportion']
                });

            expect(res.status).toBe(401);
        });

        it('should validate required fields', async () => {
            const res = await request(app)
                .post('/api/styles')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Incomplete Style',
                    period: '',
                    description: '',
                    characteristics: []
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });
    });

    describe('GET /api/styles', () => {
        it('should get all styles', async () => {
            const res = await request(app).get('/api/styles');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty('name', 'Gothic Architecture');
        });
    });

    describe('GET /api/styles/:id', () => {
        it('should get style by ID', async () => {
            const res = await request(app).get(`/api/styles/${styleId}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id', styleId);
            expect(res.body).toHaveProperty('name', 'Gothic Architecture');
        });

        it('should return 404 for non-existent style', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/api/styles/${nonExistentId}`);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('msg', 'Style not found');
        });
    });

    describe('PUT /api/styles/:id', () => {
        it('should update style when user is creator', async () => {
            const updateData = {
                description: 'Updated description for Gothic architecture'
            };

            const res = await request(app)
                .put(`/api/styles/${styleId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('description', updateData.description);
            expect(res.body).toHaveProperty('name', 'Gothic Architecture');
        });

        it('should not allow update without authentication', async () => {
            const res = await request(app)
                .put(`/api/styles/${styleId}`)
                .send({ name: 'Hacked Style' });

            expect(res.status).toBe(401);
        });
    });

    describe('DELETE /api/styles/:id', () => {
        it('should delete style when user is creator', async () => {
            const res = await request(app)
                .delete(`/api/styles/${styleId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('msg', 'Style removed');

            // Verify style is deleted
            const checkStyle = await Style.findById(styleId);
            expect(checkStyle).toBeNull();
        });
    });

    describe('GET /api/styles/search/:keyword', () => {
        beforeAll(async () => {
            // Create a new style for search testing
            await Style.create({
                name: 'Baroque Architecture',
                period: '17th-18th Century',
                description: 'Baroque is a highly ornate style of architecture, music, and art.',
                characteristics: ['Dramatic use of light', 'Curved lines', 'Grand scale'],
                createdBy: userId
            });
        });

        it('should search styles by keyword', async () => {
            const res = await request(app).get('/api/styles/search/baroque');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty('name', 'Baroque Architecture');
        });

        it('should return empty array for no matches', async () => {
            const res = await request(app).get('/api/styles/search/nonexistentstyle');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });
    });
});