import { Ticket } from '../../../models/ticket';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledEvent, OrderStatus } from '@andytix/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {

    const orderId = mongoose.Types.ObjectId().toHexString();
    const listener = new OrderCancelledListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: 'what',
        price: 67,
        userId: 'arb'
    });
    ticket.set({ orderId });
    
    await ticket.save();



    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, data, orderId, msg };

};

it('updates the ticket, publishes an event, and acks the message', async () => {

    const { msg, data, ticket, orderId, listener } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();

    expect(natsWrapper.client.publish).toHaveBeenCalled();

});