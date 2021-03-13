import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('fetches the order', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price:50
    });
    await ticket.save();

    const cookie = global.getCookie();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ ticketId: ticket.id })
        .expect(201);

    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', cookie)
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if requesting a different users order', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price:50
    });
    await ticket.save();

    const cookie = global.getCookie();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', global.getCookie())
        .send()
        .expect(401);

});
