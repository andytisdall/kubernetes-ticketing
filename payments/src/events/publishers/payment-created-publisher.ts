import { Subjects, Publisher, PaymentCreatedEvent } from '@andytix/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}