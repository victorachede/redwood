#!/usr/bin/env node
/**
 * Layout gate — run against a dev or preview server before shipping.
 *
 *   node scripts/check-layout.js [baseUrl]
 *
 * Asserts that on the phone widths this app is actually used at, no element
 * extends past the right edge of the viewport.
 *
 * It measures element edges rather than `scrollWidth > clientWidth`, and
 * that distinction is the whole point. A grid/flex child defaults to
 * `min-width: auto`, so a track cannot shrink below its content's
 * min-content width; when an `overflow-hidden` ancestor then cuts the
 * overflow off, `scrollWidth` never grows and a scrollWidth check passes
 * while the page is visibly chopped. That is exactly how a clipped landing
 * page shipped once already. Element edges catch it.
 *
 * Exits non-zero on any offender, so it can gate CI.
 */

const { chromium } = require('playwright-core')

const BASE = process.argv[2] || process.env.EWIN_BASE_URL || 'http://localhost:3000'
const EXEC = process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

/** Widths chosen from the low-to-mid Android range this app is built for. */
const VIEWPORTS = [
  [360, 780],
  [390, 844],
  [414, 896],
]

const ROUTES = ['/', '/pricing', '/dashboard', '/cards', '/settings', '/login', '/signup', '/support']

async function main() {
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox'] })
  let failures = 0

  for (const [width, height] of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    })

    for (const route of ROUTES) {
      const page = await ctx.newPage()
      try {
        await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 })
        await page.waitForTimeout(600)

        const bad = await page.evaluate((vw) => {
          const out = []
          for (const el of document.querySelectorAll('body *')) {
            const r = el.getBoundingClientRect()
            if (r.width === 0 || r.height === 0) continue
            // 1px of tolerance for sub-pixel rounding.
            if (r.right > vw + 1) {
              out.push({
                tag: el.tagName.toLowerCase(),
                cls: String(el.className || '').slice(0, 60),
                right: Math.round(r.right),
                width: Math.round(r.width),
                text: (el.textContent || '').trim().slice(0, 40),
              })
            }
          }
          return out.slice(0, 10)
        }, width)

        if (bad.length) {
          failures += bad.length
          console.log(`\nFAIL  ${width}px ${route} — ${bad.length} element(s) past the edge`)
          for (const b of bad) {
            console.log(
              `        right=${String(b.right).padStart(5)} w=${String(b.width).padStart(4)} ` +
                `<${b.tag}> ${b.cls} | "${b.text}"`,
            )
          }
        } else {
          console.log(`ok    ${width}px ${route}`)
        }
      } catch (err) {
        failures++
        console.log(`FAIL  ${width}px ${route} — ${err.message}`)
      } finally {
        await page.close()
      }
    }
    await ctx.close()
  }

  await browser.close()
  console.log(failures ? `\n${failures} layout failure(s)` : '\nno element extends past the viewport')
  process.exit(failures ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
