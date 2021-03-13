import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async (done) => {

    const ticket = Ticket.build({
        title: 'thing',
        price: 5,
        userId: 'abc'
    })

    await ticket.save();

    const first = await Ticket.findById(ticket.id);
    const second = await Ticket.findById(ticket.id);

    first?.set({ price: 10 });
    second?.set({ price: 15 });

    await first?.save();

    try {
        await second?.save();
    } catch (err) {
        return done();
    }

    throw new Error('error expected on second save');

});

it('implements version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'thing',
        price: 45,
        userId: '123'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
})