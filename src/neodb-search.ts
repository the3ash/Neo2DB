const NEODB_ORIGIN = 'https://neodb.social'
const AUTO_FETCH_HASH = '#neo2db-auto-fetch'
const DOUBAN_HOSTS = ['music.douban.com', 'movie.douban.com', 'book.douban.com']

export function isDoubanSubjectUrl(url: URL): boolean {
  return (
    url.protocol === 'https:' &&
    DOUBAN_HOSTS.includes(url.hostname) &&
    /^\/subject\/\d+\/?$/.test(url.pathname)
  )
}

export function buildNeoDBSearchUrl(doubanUrl: URL): string {
  const searchUrl = new URL('/search', NEODB_ORIGIN)
  // Tracking parameters and page anchors are not part of the item's identity.
  searchUrl.searchParams.set('q', `${doubanUrl.origin}${doubanUrl.pathname}`)
  searchUrl.hash = AUTO_FETCH_HASH
  return searchUrl.href
}

export function autoFetchNeoDBItem(page: Window): void {
  const url = new URL(page.location.href)
  if (url.origin !== NEODB_ORIGIN || url.hash !== AUTO_FETCH_HASH) return

  // Consume the intent before submitting, including on an existing item's redirect.
  // Reloading or going back must not trigger another automatic fetch.
  url.hash = ''
  page.history.replaceState(page.history.state, '', url.href)
  if (url.pathname !== '/search' && url.pathname !== '/search/') return

  const query = url.searchParams.get('q')
  if (!query || !URL.canParse(query) || !isDoubanSubjectUrl(new URL(query))) return

  // NeoDB renders this form only for missing URLs. Reuse its CSRF token and
  // native POST flow so progress, redirects and failures stay owned by NeoDB.
  const forms = page.document.querySelectorAll<HTMLFormElement>('main form')
  for (const form of forms) {
    if (form.method.toLowerCase() !== 'post' || form.action !== `${NEODB_ORIGIN}/fetch`) continue
    const source = form.querySelector<HTMLInputElement>('input[name="url"]')
    const csrf = form.querySelector<HTMLInputElement>('input[name="csrfmiddlewaretoken"]')
    if (source?.value !== query || !csrf?.value) continue

    form.requestSubmit()
    return
  }
}
