import test from 'ava'
import createTestServer from '.'
import got from 'got'

test('server created', async t => {
  const app = await createTestServer()
  t.truthy(app.port)
  t.truthy(app.url)
  await app.close()
})

test('request handler', async t => {
  const app = await createTestServer()
  const msg = 'Nobody Lost, Nobody Found'
  app.use(ctx => (ctx.body = msg))
  const { body } = await got(app.url)
  t.log(body)
  t.is(body, msg)
  await app.close()
})
