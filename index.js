const { print } = require('@ianwalter/print')
const createKoaServer = require('./koa')
const createExpressServer = require('./express')

process.on('uncaughtException', err => print.error('uncaughtException', err))
process.on('unhandledRejection', err => print.error('unhandledRejection', err))

module.exports = { createKoaServer, createExpressServer }
