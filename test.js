import test from 'ava'
import got from 'got'
import puppeteerHelper from '@ianwalter/puppeteer-helper'
import createTestServer from '.'

const withPage = puppeteerHelper([], { dumpio: true })

test('server created', async t => {
  const server = await createTestServer()
  t.truthy(server.port)
  t.truthy(server.url)
  await server.close()
})

test('request handler', async t => {
  const server = await createTestServer()
  const msg = 'Nobody Lost, Nobody Found'
  server.use(ctx => (ctx.body = msg))
  const { body } = await got(server.url)
  t.is(body, msg)
  await server.close()
})

test('json response', async t => {
  const server = await createTestServer()
  server.use(ctx => (ctx.body = { name: 'Out There On the Ice' }))
  const { body } = await got(server.url)
  t.snapshot(body)
  await server.close()
})

test('cors', withPage, async (t, page) => {
  const server = await createTestServer()
  server.use(ctx => (ctx.body = 'Moments'))
  const result = await page.evaluate(
    url => window.fetch(url).then(response => response.text()),
    server.url
  )
  t.is(result, 'Moments')
})
