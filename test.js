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
  t.is(body, msg)
  await app.close()
})

test('json response', async t => {
  const app = await createTestServer()
  app.use(ctx => (ctx.body = { name: 'Out There On the Ice' }))
  const { body } = await got(app.url)
  t.snapshot(body)
  await app.close()
})
