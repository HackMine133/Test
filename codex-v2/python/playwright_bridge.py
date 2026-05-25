import asyncio
import json
import os
import sys
from pathlib import Path
from playwright.async_api import async_playwright

SYSTEM_PROMPT = """You are CodeX V2 protocol engine. Always answer with [PLAN], [FILES], [COMMANDS], and [NEXT] or [READY]."""

async def main() -> None:
    scan_file = Path(sys.argv[1])
    user_message = sys.argv[2]
    scan_text = scan_file.read_text(encoding="utf-8")
    profile_dir = Path(__file__).resolve().parents[1] / "profiles" / "default"
    profile_dir.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
      browser = await p.chromium.launch_persistent_context(str(profile_dir), headless=True)
      page = await browser.new_page()
      await page.goto("https://chatgpt.com")
      full_prompt = f"SYSTEM:\n{SYSTEM_PROMPT}\n\nPROJECT_SCAN:\n<attached file: {scan_file.name}>\n\nUSER:\n{user_message}"
      await page.set_content(f"<pre id='out'>{json.dumps({'echo': full_prompt, 'scan': scan_text[:4000]})}</pre>")
      raw = await page.text_content("#out")
      await browser.close()

    payload = json.loads(raw or "{}")
    print("[PLAN]\nLocal fallback plan\n\n[FILES]\n\n[COMMANDS]\n\n[READY]\n" + payload.get("echo", "done"))

if __name__ == "__main__":
    asyncio.run(main())
