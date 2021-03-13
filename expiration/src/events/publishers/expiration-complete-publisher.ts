import { Subjects, Publisher, ExpirationCompleteEvent } from '@andytix/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
    
}