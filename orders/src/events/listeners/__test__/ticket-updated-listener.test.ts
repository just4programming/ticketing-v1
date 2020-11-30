import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'
import { TicketUpdatedEvent } from '@asatickets/common'
import { TicketUpdatedListener } from '../ticket-updated-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client)

  // create and save a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  })  
  await ticket.save()

  //create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'new concert',
    price: 999,
    userId: mongoose.Types.ObjectId().toHexString()
  }

  //create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  //return all of this stuff
  return {
    msg,
    data,
    listener,
    ticket
  }
}

it('finds, updates, and saves a ticket', async () => {
  const { listener, data, ticket, msg } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message', async () => {
  const { listener, data, ticket, msg } = await setup()

  await listener.onMessage(data, msg)
  
  expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack if the event has a skipped version number', async () => {
  const { listener, data, ticket, msg } = await setup()

  data.version = ticket.version + 10

  try {
    await listener.onMessage(data, msg)
  }
  catch (err) {  
  }

  expect(msg.ack).not.toHaveBeenCalled()
})