import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@andytix/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {

    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'show',
        price: 100
    });

    await ticket.save();

    const data: TicketUpdatedEvent['data'] = {
        version: ticket.version + 1,
        id: ticket.id,
        title: 'shitty show',
        price: 5,
        userId: 'andy'
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, ticket, msg };

};

it('finds, updates, and saves a ticket', async () => {

    const { listener, data, ticket, msg } = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);


});

it('acks the message', async () => {

    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();

});

it('does not ack if the event has an incorrect version', async () => {

    const { listener, data, ticket, msg } = await setup();
    data.version = 9;
    try {
        await listener.onMessage(data, msg);
    } catch (err) {

    }
    
    expect(msg.ack).not.toHaveBeenCalled();
});