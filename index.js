'use strict'

const debug = require('debug')('twdown')
const { URL } = require('url')

module.exports = async ({ url, browserless }) => {
  const page = await browserless.page()

  await browserless.goto(page, {
    url: 'https://twdown.net',
    abortTypes: ['image', 'media', 'stylesheet', 'font']
  })

  debug('clicking input')
  await page.click('input')
  debug('typing', url)
  await page.keyboard.type(url)
  debug('clicking', '.btn-primary')
  await page.click('.btn-primary')
  debug('waiting event...')

  await page.waitFor(
    () =>
      !!document.querySelector('table') ||
      !!document.querySelector('.alert-dismissible')
  )

  debug('extracting information')
  const payload = await page.evaluate(() => {
    const getRow = n => `tbody > tr:nth-child(${n})`
    const results = []
    let index = 0

    while (true) {
      ++index
      const rowSelector = getRow(index)
      const row = document.querySelector(rowSelector)
      if (!row) break

      const quality = {}

      const sizeEl = document.querySelector(`${rowSelector} > td:nth-child(2)`)

      if (sizeEl) {
        const size = sizeEl.textContent
        const sizeArr = size.split('x')
        quality.size = size
        quality.height = Number(sizeArr[0])
        quality.width = Number(sizeArr[1])
      }

      const extEl = document.querySelector(`${rowSelector} > td:nth-child(3)`)
      if (extEl) quality.ext = extEl.textContent.toLowerCase()

      const urlEl = document.querySelector(
        `${rowSelector} > td:nth-child(5) > a`
      )
      if (urlEl) {
        const url = urlEl.href
        quality.url = url
        quality.protocol = new URL(url).protocol.replace(':', '')
      }

      results.push(quality)
    }

    return results
  })

  await page.close()
  return payload
}
