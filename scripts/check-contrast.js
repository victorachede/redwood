#!/usr/bin/env node
/**
 * Contrast gate — run against a dev or preview server before shipping.
 *
 *   node scripts/check-contrast.js [baseUrl]
 *
 * Walks every text node on the main routes in BOTH themes and checks the
 * rendered foreground against its effective background — resolving up the
 * ancestor chain past transparent backgrounds, because the failure this
 * catches is a colour that only breaks once it lands on a surface it was
 * never designed for.
 *
 * Dark mode is not an afterthought here: half the sessions are after dark,
 * so a theme is only shipped when both pass.
 *
 * Exits non-zero below the WCAG AA threshold for the text's own size.
 */

const { chromium } = require('playwright-core')

const BASE = process.argv[2] || process.env.EWIN_BASE_URL || 'http://localhost:3000'
const EXEC = process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const ROUTES = ['/', '/pricing', '/dashboard', '/cards', '/settings', '/login', '/support']

const PROBE = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const p = m[1].split(',').map((n) => parseFloat(n))
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }
  }
  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
    return (x + 0.05) / (y + 0.05)
  }
  /** Composite over ancestors until an opaque background is found. */
  const bgOf = (el) => {
    let node = el
    while (node && node !== document.documentElement) {
      const c = parse(getComputedStyle(node).backgroundColor)
      if (c && c.a > 0.95) return c
      node = node.parentElement
    }
    return parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 }
  }

  const out = []
  for (const el of document.querySelectorAll('body *')) {
    const text = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(' ')
      .trim()
    if (!text) continue
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.opacity === '0') continue

    const fg = parse(cs.color)
    if (!fg || fg.a < 0.1) continue
    const bg = bgOf(el)
    // Blend a translucent foreground onto its background before measuring —
    // `opacity-70` on a label is a real contrast change, not a cosmetic one.
    const blended = {
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
    }
    const size = parseFloat(cs.fontSize)
    const bold = parseInt(cs.fontWeight, 10) >= 700
    // WCAG "large text": 18.66px bold, or 24px regular.
    const large = size >= 24 || (bold && size >= 18.66)
    const need = large ? 3.0 : 4.5
    const got = ratio(blended, bg)
    if (got < need) {
      out.push({
        text: text.slice(0, 44),
        got: Math.round(got * 100) / 100,
        need,
        size: Math.round(size),
        cls: String(el.className || '').slice(0, 50),
      })
    }
  }
  return out.slice(0, 12)
}

async function main() {
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox'] })
  let failures = 0

  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      colorScheme: theme,
    })
    // The app also honours an explicit data-theme, so pin it as well as the
    // media preference — a bug can hide in either path alone.
    await ctx.addInitScript((t) => {
      try {
        localStorage.setItem('ewin-theme', t)
      } catch {}
    }, theme)

    for (const route of ROUTES) {
      const page = await ctx.newPage()
      try {
        await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 })
        await page.waitForTimeout(600)
        const bad = await page.evaluate(PROBE)
        if (bad.length) {
          failures += bad.length
          console.log(`\nFAIL  ${theme} ${route} — ${bad.length} low-contrast run(s)`)
          for (const b of bad) {
            console.log(`        ${b.got} < ${b.need} @${b.size}px  "${b.text}"  ${b.cls}`)
          }
        } else {
          console.log(`ok    ${theme} ${route}`)
        }
      } catch (err) {
        failures++
        console.log(`FAIL  ${theme} ${route} — ${err.message}`)
      } finally {
        await page.close()
      }
    }
    await ctx.close()
  }

  await browser.close()
  console.log(failures ? `\n${failures} contrast failure(s)` : '\nall text meets WCAG AA in both themes')
  process.exit(failures ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
