const { test } = require('@ianwalter/bff')
const { requester } = require('@ianwalter/requester')
const { createKoaServer } = require('..')

test('Koa server created', async ({ expect }) => {
  const server = await createKoaServer()
  expect(server.port).toBeGreaterThan(0)
  expect(server.url).toBeTruthy()
  await server.close()
})

test('Koa request handler', async ({ expect }) => {
  const server = await createKoaServer()
  const msg = 'Nobody Lost, Nobody Found'
  server.use(ctx => (ctx.body = msg))
  const { body } = await requester.get(server.url)
  expect(body).toBe(msg)
  await server.close()
})

test('Koa json response', async ({ expect }) => {
  const server = await createKoaServer()
  server.use(ctx => (ctx.body = { name: 'Out There On the Ice' }))
  const { body } = await requester.get(server.url)
  expect(body).toMatchSnapshot()
  await server.close()
})

test('Koa json request', async ({ expect }) => {
  const server = await createKoaServer()
  server.use(ctx => (ctx.body = ctx.request.body))
  const body = { name: 'When Am I Gonna Lose You' }
  const response = await requester.post(server.url, { body })
  expect(response.body).toEqual(body)
  await server.close()
})

test.skip('Koa cors', async (t, page) => {
  const server = await createKoaServer()
  server.use(ctx => (ctx.body = 'Moments'))
  const result = await page.evaluate(
    url => window.fetch(url).then(response => response.text()),
    server.url
  )
  t.is(result, 'Moments')
})

test('Koa error', async ({ pass }) => {
  const server = await createKoaServer()
  server.use(() => new Promise((resolve, reject) => reject(new Error('Nooo!'))))
  try {
    await requester.get(server.url)
  } catch (err) {
    pass()
  } finally {
    await server.close()
  }
})
