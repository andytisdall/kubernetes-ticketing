import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns 404 if provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.getCookie())
        .send({
            title: 'gdsgs', price: 20
        })
        .expect(404);
});

it('returns 401 if user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'gdsgs', price: 20
        })
        .expect(401);
});

it('returns 401 if user does not own the ticket', async () => {
    const response = await request(app)
        .post('/api/tickets/')
        .set('Cookie', global.getCookie())
        .send({
            title: 'gdsgs', price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.getCookie())
        .send({
            title: 'title',
            price: 10
        })
        .expect(401);

});

it('returns 400 with invalid title or price', async () => {
    const cookie = global.getCookie();
    const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', cookie)
    .send({
        title: 'titties', price: 100
    });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '', price: 20
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'title', price: -10
        })
        .expect(400);

});

it('updates the ticket provided valid inputs', async () => {

    const cookie = global.getCookie();
    const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', cookie)
    .send({
        title: 'titties', price: 100
    });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'boobies', price: 50
        })
        .expect(200);

    const ticket = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(ticket.body.title).toEqual('boobies');
    expect(ticket.body.price).toEqual(50);
});

it('publishes an event', async () => {

    const cookie = global.getCookie();
    const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', cookie)
    .send({
        title: 'titties', price: 100
    });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'boobies', price: 50
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

});

it('rejects updates if a ticket is reserved', async() => {

    const cookie = global.getCookie();
    const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', cookie)
    .send({
        title: 'titties', price: 100
    });

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() })
    await ticket?.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'boobies', price: 50
        })
        .expect(400);

})