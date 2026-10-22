#!/usr/bin/env python3
"""Sync the writings on the website with a Zotero library.

Reads every item in the library that has the given person as an author or
editor, writes their bibliographic data (CSL JSON) to writings.json and copies
their PDF attachments to writings/zotero/. Runs as a GitHub Action (see
.github/workflows/zotero-sync.yml); the Zotero API key stays a repository
secret and never reaches the website.

Settings (environment variables):
  ZOTERO_USER_ID        numeric Zotero user ID (required)
  ZOTERO_API_KEY        read-only API key with access to notes and files
  ZOTERO_AUTHOR_FAMILY  family name to look for (default: Häusler)
  ZOTERO_AUTHOR_GIVEN   given name to look for (default: Dennis)
  ZOTERO_API            API address (default: https://api.zotero.org)

Zotero tags control what goes online:
  website: hide         on an item: the item is left out completely
  website: no pdf       on an item: the item is listed, but no PDF is published
  website: pdf          on a PDF attachment: this one is published when an item has several

When an item has several PDFs and none is tagged, the one Zotero itself opens
for the item (its "best attachment") is used, otherwise the oldest.

A PDF that is not in Zotero can be added by hand as writings/<item key>.pdf,
where the item key is the eight-character key of the Zotero item.
"""
import hashlib
import json
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = os.environ.get('ZOTERO_API', 'https://api.zotero.org').rstrip('/')
USER = os.environ.get('ZOTERO_USER_ID', '').strip()
KEY = os.environ.get('ZOTERO_API_KEY', '').strip()
FAMILY = os.environ.get('ZOTERO_AUTHOR_FAMILY', 'Häusler')
GIVEN = os.environ.get('ZOTERO_AUTHOR_GIVEN', 'Dennis')
TAG_HIDE = 'website: hide'
TAG_NO_PDF = 'website: no pdf'
TAG_PDF = 'website: pdf'

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / 'writings.json'
MANUAL_DIR = ROOT / 'writings'
PDF_DIR = ROOT / 'writings' / 'zotero'
STATE = PDF_DIR / 'sync-state.json'
MAX_BYTES = 95 * 1024 * 1024   # GitHub refuses files over 100 MB


def canon(text):
    """Lower case, no accents, 'ae' read as 'a', so Häusler matches Haeusler."""
    text = unicodedata.normalize('NFKD', str(text or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z]', '', text.lower().replace('ae', 'a'))


def request(path, params=None, raw=False):
    url = f'{API}{path}'
    if params:
        url += '?' + urllib.parse.urlencode(params)
    headers = {'Zotero-API-Version': '3', 'User-Agent': 'entwerfen-in-der-zeit-sync'}
    if KEY:
        headers['Zotero-API-Key'] = KEY
    for attempt in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=120) as res:
                body = res.read()
                if res.headers.get('Backoff'):
                    time.sleep(int(res.headers['Backoff']))
                return (body if raw else json.loads(body)), res.headers
        except urllib.error.HTTPError as err:
            if err.code in (429, 503) and attempt < 4:
                time.sleep(int(err.headers.get('Retry-After') or 5 * (attempt + 1)))
                continue
            if err.code == 403:
                sys.exit('Zotero refused access (403). Check that ZOTERO_API_KEY is set and allows reading the library and its files.')
            raise
    raise RuntimeError(f'Zotero did not answer: {url}')


def library_items():
    start = 0
    while True:
        batch, headers = request(f'/users/{USER}/items/top', {
            'format': 'json', 'include': 'data,csljson', 'limit': 100, 'start': start,
        })
        yield from batch
        start += len(batch)
        if not batch or start >= int(headers.get('Total-Results', start)):
            break


def is_by_person(item):
    family, given = canon(FAMILY), canon(GIVEN)
    for c in item.get('data', {}).get('creators', []):
        last = canon(c.get('lastName') or '')
        first = canon(c.get('firstName') or '')
        single = canon(c.get('name') or '')
        if last == family and (not first or first.startswith(given) or first == given[:1]):
            return True
        if single and family in single and given in single:
            return True
    return False


def pdf_attachment(item):
    """The PDF to publish: tagged 'website: pdf', else Zotero's best attachment, else the oldest."""
    children, _ = request(f'/users/{USER}/items/{item["key"]}/children', {'format': 'json'})
    pdfs = [c['data'] for c in children
            if c.get('data', {}).get('itemType') == 'attachment'
            and c['data'].get('contentType') == 'application/pdf'
            and c['data'].get('linkMode') in ('imported_file', 'imported_url')]  # linked files never reach the server
    if not pdfs:
        return None
    tagged = [p for p in pdfs if canon(TAG_PDF) in {canon(t.get('tag')) for t in p.get('tags', [])}]
    if tagged:
        return tagged[0]
    best = (item.get('links', {}).get('attachment', {}).get('href') or '').rstrip('/').split('/')[-1]
    for p in pdfs:
        if p.get('key') == best:
            return p
    return sorted(pdfs, key=lambda p: p.get('dateAdded', ''))[0]


def slug(text):
    text = unicodedata.normalize('NFKD', str(text or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', text).strip('-')[:60] or 'writing'


def issued_key(entry):
    parts = (entry.get('issued') or {}).get('date-parts') or [[0]]
    return [int(p) if str(p).isdigit() else 0 for p in (parts[0] + [0, 0])[:3]]


def main():
    if not USER:
        sys.exit('Set ZOTERO_USER_ID, the numeric Zotero user ID.')
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    state = json.loads(STATE.read_text()) if STATE.exists() else {}
    new_state, entries, used, kept = {}, [], set(), set()

    for item in library_items():
        if not is_by_person(item):
            continue
        tags = {canon(t.get('tag')) for t in item.get('data', {}).get('tags', [])}
        if canon(TAG_HIDE) in tags:
            continue
        no_pdf = canon(TAG_NO_PDF) in tags
        key = item['key']
        entry = dict(item.get('csljson') or {})
        if not entry.get('title'):
            continue

        name = slug(entry.get('title-short') or entry['title'])
        while name in used:
            name += '-2'
        used.add(name)
        entry['id'] = name          # gives readable reader links: hub.html?read=<id>
        entry['zotero'] = key
        entry['file'] = ''

        manual = MANUAL_DIR / f'{key}.pdf'
        target = PDF_DIR / f'{key}.pdf'
        attachment = pdf_attachment(item) if KEY and not no_pdf else None
        if attachment:
            chosen = attachment.get('title') or attachment.get('filename') or attachment['key']
            print(f'  {entry["title"][:60]}: PDF "{chosen}"')
        if attachment:
            md5 = attachment.get('md5') or ''
            if state.get(key) == md5 and md5 and target.exists():
                new_state[key] = md5
            else:
                data, _ = request(f'/users/{USER}/items/{attachment["key"]}/file', raw=True)
                if len(data) > MAX_BYTES:
                    print(f'  skipped PDF of "{entry["title"]}": {len(data) // 1048576} MB is too large for GitHub')
                    data = None
                if data:
                    target.write_bytes(data)
                    new_state[key] = md5 or hashlib.md5(data).hexdigest()
                    print(f'  PDF updated: {entry["title"]}')
            if target.exists():
                entry['file'] = f'writings/zotero/{key}.pdf'
                kept.add(target.name)
        if not entry['file'] and manual.exists() and not no_pdf:
            entry['file'] = f'writings/{key}.pdf'

        entries.append(entry)

    # PDFs of items that left the library or lost their attachment
    for old in PDF_DIR.glob('*.pdf'):
        if old.name not in kept:
            old.unlink()
            print(f'  removed {old.name}')

    entries.sort(key=issued_key, reverse=True)
    MANIFEST.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    STATE.write_text(json.dumps(new_state, indent=2, sort_keys=True) + '\n')
    with_pdf = sum(1 for e in entries if e['file'])
    print(f'{len(entries)} writings by {GIVEN} {FAMILY}, {with_pdf} with PDF.')


if __name__ == '__main__':
    main()
