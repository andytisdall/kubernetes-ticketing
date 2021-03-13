import { Publisher, OrderCancelledEvent, Subjects } from '@andytix/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}