import request from 'supertest'
import { app } from '../../app'

it('clears the cookie after signing out', async() => {
  const cookie = await global.signin()

  const response = await request(app)
    .post('/api/users/signout')
    .set('Cookie', cookie)
    .send({})
    .expect(200)

  expect(response.get('Set-Cookie')[0]).toEqual(
    'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  )
})

