import request from 'supertest'
import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'

it('marks an order as canceled', async () => {
  //create a ticekt with Ticket Model
  const ticket = Ticket.build({
    title: 'concert',
    price: 20
  })
  await ticket.save()

  const user = global.signin()
  
  //make a request to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  //make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204)

  //expectation to make sure the thing is canceled
  const editedOrder = await Order.findById(order.id)
  expect(editedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it.todo('emits an order cancelled event')