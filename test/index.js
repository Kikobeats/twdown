'use strict'

const test = require('ava')

const browserless = require('browserless')()

const twdown = require('..')

test('success', async t => {
  t.snapshot(
    await twdown({
      url: 'https://twitter.com/verge/status/957383241714970624',
      browserless
    })
  )
})

// test('error', async t => {
//   t.snapshot(
//     await twdown({
//       url: 'https://github.com',
//       browserless
//     })
//   )
// })
