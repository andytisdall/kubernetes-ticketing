import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';



it('returns an error if ticket does not exist', async () => {
    const ticketId = mongoose.Types.ObjectId();
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.getCookie())
        .send({
            ticketId
        })
        .expect(404);

});



it('returns an error if ticket is reserved', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();
    const order = Order.build({
        ticket,
        userId: 'gwa',
        status: OrderStatus.Created,
        expiresAt: new Date()
    });
    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.getCookie())
        .send({ ticketId: ticket.id })
        .expect(400);

});



it('reserves a ticket given valid info', async () => {
    const ticket = Ticket.build({
        title: 'thing',
        id: mongoose.Types.ObjectId().toHexString(),
        price: 200
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.getCookie())
        .send({ ticketId: ticket.id })
        .expect(201);
});

it('emits an order created event', async () => {

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'thing',
        price: 200
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.getCookie())
        .send({ ticketId: ticket.id })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

});