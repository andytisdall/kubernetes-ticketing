import { Publisher, Subjects, TicketUpdatedEvent } from '@andytix/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}