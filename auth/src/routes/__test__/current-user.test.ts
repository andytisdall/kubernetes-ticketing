import request from 'supertest';
import { app } from '../../app';

it('responds with the user info', async () => {

    const cookie = await global.getCookie();

    const response = await request(app)
        .get('/api/users/currentUser')
        .set('Cookie', cookie)
        .send()
        .expect(200);
    
    expect(response.body.currentUser.email).toEqual('test@test.com');

    
});

it('returns null if not authenticated', async () => {
    const response = await request(app)
        .get('/api/users/currentuser')
        .send()
        .expect(200);

    expect(response.body.currentUser).toEqual(null);
})