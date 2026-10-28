#!/usr/bin/env python3
"""Collect public legacy-site content and original image assets with provenance.

Usage: python scripts/import-legacy-site.py [--max-pages 12]
Uses the inherited HTTPS proxy and TLS trust. Never circumvents a denied host.
Files are retained under source-materials/legacy-site; existing originals are kept.
Image candidates are NOT automatically labeled as successful orders.
"""
import argparse
import hashlib
import json
import re
import sys
import time
from collections import deque
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit, urldefrag, unquote
from urllib.request import Request, urlopen

BASE = 'https://kilangrepairsofa.com/'
HOSTS = {'kilangrepairsofa.com', 'www.kilangrepairsofa.com'}
OUTPUT = Path(__file__).resolve().parents[1] / 'source-materials' / 'legacy-site'
MAX_BYTES = 24 * 1024 * 1024


def fetch(url):
    req = Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; WebsiteMigrationReview/1.0)'})
    with urlopen(req, timeout=30) as response:
        final = response.geturl()
        if urlsplit(final).hostname not in HOSTS:
            raise ValueError('Redirected outside authorized source hosts: ' + str(urlsplit(final).hostname))
        data = response.read(MAX_BYTES + 1)
        if len(data) > MAX_BYTES:
            raise ValueError('Source exceeds 24 MiB limit')
        return data, response.headers.get_content_type(), final


def clean(s):
    return re.sub(r'\s+', ' ', s).strip()


class Page(HTMLParser):
    def __init__(self, url):
        super().__init__(convert_charrefs=True)
        self.url = url
        self.skip = 0
        self.title = ''
        self.in_title = False
        self.text = []
        self.links = []
        self.images = []
        self.headings = []
        self.heading = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('script', 'style', 'noscript'):
            self.skip += 1
        if tag == 'title':
            self.in_title = True
        if tag in ('h1', 'h2', 'h3'):
            self.heading = {'level': tag, 'text': ''}
        if tag == 'a' and a.get('href'):
            self.links.append(urljoin(self.url, a['href']))
        if tag == 'img':
            variants = []
            for key in ('data-srcset', 'srcset'):
                for candidate in a.get(key, '').split(','):
                    pieces = candidate.strip().split()
                    if pieces and not pieces[0].startswith('data:'):
                        width = int(re.sub(r'\D', '', pieces[-1]) or 0) if len(pieces) > 1 else 0
                        variants.append((width, urljoin(self.url, pieces[0])))
            src = next((a.get(k) for k in ('data-src', 'data-lazy-src', 'src') if a.get(k) and not a[k].startswith('data:')), '')
            if variants:
                src = max(variants)[1]
            if src:
                self.images.append({'url': urljoin(self.url, src), 'alt': a.get('alt', ''), 'title': a.get('title', ''), 'source_page': self.url, 'variants': [u for _, u in sorted(variants, reverse=True)]})
        for match in re.findall(r'url\([\'\"]?([^\)\'\"]+)', a.get('style', '')):
            if not match.startswith('data:'):
                self.images.append({'url': urljoin(self.url, match), 'alt': '', 'title': '', 'source_page': self.url, 'kind': 'inline-background'})

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript'):
            self.skip = max(0, self.skip - 1)
        if tag == 'title':
            self.in_title = False
        if self.heading and tag == self.heading['level']:
            self.heading['text'] = clean(self.heading['text'])
            self.headings.append(self.heading)
            self.heading = None

    def handle_data(self, data):
        if self.skip:
            return
        if self.in_title:
            self.title += data
        if self.heading:
            self.heading['text'] += data + ' '
        text = clean(data)
        if text:
            self.text.append(text)


def local_page(url):
    u = urlsplit(url)
    return u.scheme in ('http', 'https') and u.hostname in HOSTS and not re.search(r'\.(?:jpg|png|webp|gif|svg|pdf|mp4|zip)$', u.path, re.I)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--max-pages', type=int, default=12)
    args = ap.parse_args()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / 'pages').mkdir(exist_ok=True)
    (OUTPUT / 'originals').mkdir(exist_ok=True)
    queue = deque([BASE])
    visited, pages, images, failures = set(), [], {}, []
    while queue and len(visited) < args.max_pages:
        url = urldefrag(queue.popleft())[0]
        if url in visited or not local_page(url):
            continue
        visited.add(url)
        try:
            raw, content_type, final = fetch(url)
            if content_type != 'text/html':
                continue
            parser = Page(final)
            parser.feed(raw.decode('utf-8', errors='replace'))
            key = hashlib.sha256(final.encode()).hexdigest()[:12]
            page_file = OUTPUT / 'pages' / (key + '.html')
            if not page_file.exists():
                page_file.write_bytes(raw)
            text_file = OUTPUT / 'pages' / (key + '.txt')
            if not text_file.exists():
                text_file.write_text('\n'.join(parser.text), encoding='utf-8')
            pages.append({'url': final, 'title': clean(parser.title), 'headings': parser.headings, 'text_file': str(text_file.relative_to(OUTPUT))})
            for image in parser.images:
                source = image['url']
                if urlsplit(source).hostname not in HOSTS:
                    failures.append({'url': source, 'reason': 'External image host requires separate access review'})
                    continue
                if source not in images:
                    images[source] = {**image, 'appearances': [], 'case_status': 'unreviewed — do not present as a completed order without source evidence'}
                images[source]['appearances'].append({'page': final, 'alt': image.get('alt', ''), 'title': image.get('title', '')})
            links = [u for u in parser.links if local_page(u)]
            links.sort(key=lambda u: (not bool(re.search(r'service|gallery|project|portfolio|about|contact|repair|upholster', urlsplit(u).path, re.I)), u))
            queue.extend(links)
            print('Read:', final, 'image candidates:', len(parser.images))
            time.sleep(.3)
        except (HTTPError, URLError, ValueError, OSError) as e:
            failures.append({'url': url, 'reason': str(e)})
            if url == BASE:
                print('Cannot read the source homepage:', str(e), file=sys.stderr)
                print('No company facts or case photos have been imported.', file=sys.stderr)
                return 2
    for url, item in images.items():
        try:
            raw, mime, final = fetch(url)
            if not mime.startswith('image/'):
                raise ValueError('Not an image: ' + mime)
            digest = hashlib.sha256(raw).hexdigest()
            suffix = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.svg' }.get(mime, '.img')
            label = re.sub(r'[^a-zA-Z0-9_-]+', '-', Path(unquote(urlsplit(url).path)).stem)[:70].strip('-') or 'image'
            target = OUTPUT / 'originals' / (label + '-' + digest[:12] + suffix)
            if not target.exists():
                target.write_bytes(raw)
            item.update({'original_file': str(target.relative_to(OUTPUT)), 'sha256': digest, 'bytes': len(raw), 'mime': mime, 'resolved_url': final})
        except (HTTPError, URLError, ValueError, OSError) as e:
            item['download_error'] = str(e)
            failures.append({'url': url, 'reason': str(e)})
    stamp = time.strftime('%Y%m%dT%H%M%SZ', time.gmtime())
    manifest = {'source': BASE, 'captured_at': stamp, 'pages': pages, 'image_candidates': list(images.values()), 'failures': failures}
    destination = OUTPUT / ('manifest-' + stamp + '.json')
    destination.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Saved manifest:', destination)
    print('Pages:', len(pages), 'image candidates:', len(images), 'issues:', len(failures))
    return 0 if pages else 2

if __name__ == '__main__':
    raise SystemExit(main())
