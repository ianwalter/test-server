const { test } = require('@ianwalter/bff')
const r2 = require('r2')
const createTestServer = require('..')

test('server created', async ({ expect }) => {
  const server = await createTestServer()
  expect(server.port).toBeGreaterThan(0)
  expect(server.url).toBeTruthy()
  await server.close()
})

test('request handler', async ({ expect }) => {
  const server = await createTestServer()
  const msg = 'Nobody Lost, Nobody Found'
  server.use(ctx => (ctx.body = msg))
  const body = await r2(server.url).text
  expect(body).toBe(msg)
  await server.close()
})

test('json response', async ({ expect }) => {
  const server = await createTestServer()
  server.use(ctx => (ctx.body = { name: 'Out There On the Ice' }))
  const body = await r2(server.url).text
  expect(body).toMatchSnapshot()
  await server.close()
})

test('json request', async ({ expect }) => {
  const server = await createTestServer()
  server.use(ctx => (ctx.body = ctx.request.body))
  const json = { name: 'When Am I Gonna Lose You' }
  const body = await r2.post(server.url, { json }).json
  expect(body).toEqual(json)
  await server.close()
})

// test('cors', async (t, page) => {
//   const server = await createTestServer()
//   server.use(ctx => (ctx.body = 'Moments'))
//   const result = await page.evaluate(
//     url => window.fetch(url).then(response => response.text()),
//     server.url
//   )
//   t.is(result, 'Moments')
// })

test('error', async ({ pass }) => {
  const server = await createTestServer()
  server.use(() => new Promise((resolve, reject) => reject(new Error('Nooo!'))))
  try {
    await r2(server.url).json
  } catch (err) {
    pass()
  } finally {
    await server.close()
  }
})
