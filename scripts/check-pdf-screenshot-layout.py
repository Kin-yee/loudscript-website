"""Browser regression probe (optional: Python Playwright and Chrome).

Serve the site locally, then run:
    python3 scripts/check-pdf-screenshot-layout.py http://127.0.0.1:8000/
Pass a locale's landing URL instead to check its generated page.
"""
import sys
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright


def check(browser, url, width):
    page = browser.new_page(viewport={"width": width, "height": 800})
    try:
        page.route("**/*", lambda r: r.continue_() if urlsplit(r.request.url).netloc
                   == urlsplit(url).netloc else r.abort())
        page.goto(url, wait_until="load")
        image = page.locator('.mac-detail-img img[src$="/mac-main-window.webp"]')
        assert not image.evaluate("img => img.complete"), "expected an unloaded detail image"
        measure = "img => [img.clientWidth, img.clientHeight]"
        before = image.evaluate(measure)
        image.evaluate("async img => { img.loading = 'eager'; await img.decode(); }")
        after = image.evaluate(measure)
        print(f"{width}px viewport: {before} before decode, {after} after")
        # Responsive image candidates can round the intrinsic ratio by one pixel.
        assert min(before) > 0 and max(abs(a-b) for a, b in zip(before, after)) <= 1
    finally:
        page.close()


if __name__ == "__main__":
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome")
        for width in (390, 1024, 1440):
            check(browser, sys.argv[1], width)
        browser.close()
