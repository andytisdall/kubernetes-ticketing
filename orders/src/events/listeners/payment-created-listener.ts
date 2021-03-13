import { Subjects, Listener, PaymentCreatedEvent, OrderStatus } from '@andytix/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';
import { Message } from 'node-nats-streaming';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId);

        if (!order) {
            throw new Error('order no find');
        }

        order.set({
            status: OrderStatus.Complete
        });
        await order.save();

        msg.ack();
    }
}