import { expect, test, vi } from 'vite-plus/test'
import { autoFetchNeoDBItem, buildNeoDBSearchUrl } from '../src/neodb-search'

const subject = 'https://music.douban.com/subject/38909418/'

function fetchForm({
  source = subject,
  action = 'https://neodb.social/fetch',
  method = 'post',
  csrf = 'token',
} = {}) {
  return {
    method,
    action,
    querySelector(selector: string) {
      return { value: selector === 'input[name="url"]' ? source : csrf }
    },
    requestSubmit: vi.fn(),
  }
}

function searchPage(href: string, forms: ReturnType<typeof fetchForm>[] = []): Window {
  const page = {
    location: { href },
    history: {
      state: { preserved: true } as unknown,
      replaceState(state: unknown, _title: string, url: string) {
        this.state = state
        page.location.href = url
      },
    },
    document: { querySelectorAll: () => forms },
  }
  return page as unknown as Window
}

test('music, movie and book searches encode only the subject URL and carry fetch intent', () => {
  for (const category of ['music', 'movie', 'book']) {
    const source = `https://${category}.douban.com/subject/123/`
    const url = new URL(buildNeoDBSearchUrl(new URL(`${source}?from=a&other=b#reviews`)))
    expect(url.origin + url.pathname).toBe('https://neodb.social/search')
    expect(url.searchParams.get('q')).toBe(source)
    expect(url.searchParams.size).toBe(1)
    expect(url.hash).toBe('#neo2db-auto-fetch')
  }
})

test('a missing entry submits the native form once and consumes intent before submission', () => {
  const form = fetchForm()
  const page = searchPage(buildNeoDBSearchUrl(new URL(subject)), [form])
  form.requestSubmit.mockImplementation(() => {
    expect(new URL(page.location.href).hash).toBe('')
  })
  autoFetchNeoDBItem(page)
  autoFetchNeoDBItem(page)
  expect(form.requestSubmit).toHaveBeenCalledTimes(1)
  expect(page.history.state).toEqual({ preserved: true })
})

test('manual searches do not submit forms', () => {
  const form = fetchForm()
  const url = new URL(buildNeoDBSearchUrl(new URL(subject)))
  url.hash = ''
  autoFetchNeoDBItem(searchPage(url.href, [form]))
  expect(form.requestSubmit).toHaveBeenCalledTimes(0)
})

test('existing entry redirects consume intent without fetching', () => {
  const form = fetchForm()
  const page = searchPage('https://neodb.social/album/existing#neo2db-auto-fetch', [form])
  autoFetchNeoDBItem(page)
  expect(form.requestSubmit).toHaveBeenCalledTimes(0)
  expect(page.location.href).toBe('https://neodb.social/album/existing')
})

test('unrelated forms, missing CSRF tokens and non-Douban queries are never submitted', () => {
  for (const options of [
    { source: 'https://music.douban.com/subject/999/' },
    { action: 'https://neodb.social/refetch' },
    { action: 'https://example.com/fetch' },
    { method: 'get' },
    { csrf: '' },
  ]) {
    const form = fetchForm(options)
    autoFetchNeoDBItem(searchPage(buildNeoDBSearchUrl(new URL(subject)), [form]))
    expect(form.requestSubmit).toHaveBeenCalledTimes(0)
  }
  for (const query of [
    'not a URL',
    'https://example.com/subject/123/',
    'https://music.douban.com/new_subject',
  ]) {
    const form = fetchForm({ source: query })
    const url = new URL(buildNeoDBSearchUrl(new URL(subject)))
    url.searchParams.set('q', query)
    autoFetchNeoDBItem(searchPage(url.href, [form]))
    expect(form.requestSubmit).toHaveBeenCalledTimes(0)
  }
})

test('missing or changed confirmation markup leaves the page usable without retrying', () => {
  const page = searchPage(buildNeoDBSearchUrl(new URL(subject)))
  autoFetchNeoDBItem(page)
  expect(new URL(page.location.href).hash).toBe('')
})
