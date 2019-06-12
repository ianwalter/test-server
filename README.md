# @ianwalter/test-server
> Easily create a minimal [Koa][koaUrl] server for testing

[![npm page][npmImage]][npmUrl]

## About

Inspired by [create-test-server][ctsUrl].

## Installation

```console
yarn add @ianwalter/test-server --dev
```

## Usage

```js
const { test } = require('@ianwalter/bff')
const createTestServer = require('@ianwalter/test-server')

test('got', ({ expect }) => {
  const server = await createTestServer()
  server.use(ctx => (ctx.body = 'Hello World!'))
  const response = await got(server.url)
  expect(response.body).toBe('Hello World!')
  await server.close()
})
```

## License

Apache 2.0 with Commons Clause - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://iankwalter.com)

[npmImage]: https://img.shields.io/npm/v/@ianwalter/test-server.svg
[npmUrl]: https://www.npmjs.com/package/@ianwalter/test-server
[koaUrl]: https://github.com/koajs/koa
[ctsUrl]: https://github.com/lukechilds/create-test-server
[licenseUrl]: https://github.com/ianwalter/test-server/blob/master/LICENSE
