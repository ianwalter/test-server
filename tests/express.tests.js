const { test } = require('@ianwalter/bff')
const { requester } = require('@ianwalter/requester')
const { createExpressServer } = require('..')

test('Express server created', async ({ expect }) => {
  const server = await createExpressServer()
  expect(server.port).toBeGreaterThan(0)
  expect(server.url).toBeTruthy()
  await server.close()
})

test('Express request handler', async ({ expect }) => {
  const server = await createExpressServer()
  const msg = 'Nobody Lost, Nobody Found'
  server.use((req, res) => res.send(msg))
  const { body } = await requester.get(server.url)
  expect(body).toBe(msg)
  await server.close()
})

test('Express json response', async ({ expect }) => {
  const server = await createExpressServer()
  server.use((req, res) => res.json({ name: 'Out There On the Ice' }))
  const { body } = await requester.get(server.url)
  expect(body).toMatchSnapshot()
  await server.close()
})

test('Express json request', async ({ expect }) => {
  const server = await createExpressServer()
  server.use((req, res) => res.json(req.body))
  const body = { name: 'When Am I Gonna Lose You' }
  const response = await requester.post(server.url, { body })
  expect(response.body).toEqual(body)
  await server.close()
})

test.skip('Express cors', async (t, page) => {
  const server = await createExpressServer()
  server.use(ctx => (ctx.body = 'Moments'))
  const result = await page.evaluate(
    url => window.fetch(url).then(response => response.text()),
    server.url
  )
  t.is(result, 'Moments')
})

test('Express error', async ({ pass }) => {
  const server = await createExpressServer()
  server.use((req, res, next) => next(new Error('Test Error')))
  try {
    await requester.get(server.url)
  } catch (err) {
    pass()
  } finally {
    await server.close()
  }
})
