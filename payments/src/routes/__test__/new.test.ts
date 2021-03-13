import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@andytix/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';



it('returns 404 if order does not exist', async () => {

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.getCookie())
        .send({
            token: 'fsfdfsfds',
            orderId: mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);

});

it('returns 401 if user does not match the order', async () => {

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Created
    });
    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.getCookie())
        .send({
            token: 'fsfdfsfds',
            orderId: order.id
        })
        .expect(401);
});

it('returns 400 if order is cancelled', async () => {

    const userId = mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 20,
        status: OrderStatus.Cancelled
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.getCookie(userId))
        .send({
            token: 'fsfdfsfds',
            orderId: order.id
        })
        .expect(400);


});

it('returns 201 with valid inputs', async () => {

    const userId = mongoose.Types.ObjectId().toHexString();

    const price = Math.floor(Math.random() * 100000);

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price,
        status: OrderStatus.Created
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.getCookie(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);

    const stripeCharges = await stripe.charges.list();

    const stripeCharge = stripeCharges.data.find(charge => {
        return charge.amount === price * 100;
    });

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge?.currency).toEqual('usd');

    const payment = await Payment.findOne({ stripeId: stripeCharge?.id, orderId: order.id });

    expect(payment).not.toBeNull();

});