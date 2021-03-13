import { Publisher, OrderCreatedEvent, Subjects } from '@andytix/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}