import { AlbumData } from '../src/types'

// Helper function to log messages only in development mode
const isDev = process.env.NODE_ENV !== 'production'
function devLog(...args: unknown[]) {
  if (isDev) {
    console.log('[Neo2DB]', ...args)
  }
}

// Track tabs that have already been filled to prevent duplicate filling
const formFilledTabs = new Set<number>()

// Clean up closed tabs to prevent memory leak
chrome.tabs.onRemoved.addListener((tabId) => {
  if (formFilledTabs.has(tabId)) {
    formFilledTabs.delete(tabId)
    devLog('Cleaned up closed tab:', tabId)
  }
})

// Wait for element to appear using polling (more reliable than fixed timeout)
function waitForElement(
  tabId: number,
  selector: string,
  maxAttempts = 10,
  interval = 300
): Promise<boolean> {
  return new Promise((resolve) => {
    let attempts = 0

    const check = () => {
      attempts++
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: (sel: string) => !!document.querySelector(sel),
          args: [selector],
        },
        (results) => {
          if (results?.[0]?.result) {
            resolve(true)
          } else if (attempts < maxAttempts) {
            setTimeout(check, interval)
          } else {
            devLog(`Element "${selector}" not found after ${maxAttempts} attempts`)
            resolve(false)
          }
        }
      )
    }

    check()
  })
}

export default defineBackground(() => {
  devLog('Background script started')

  // Handle messages from content script
  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    devLog('Received message:', message.action)

    if (message.action === 'fillDoubanForm') {
      const { albumData } = message

      // Store album data and open Douban form
      chrome.storage.local.set({ pendingAlbumData: albumData }, () => {
        devLog('Album data stored:', albumData.title)
        chrome.tabs.create({ url: 'https://music.douban.com/new_subject' }, async (tab) => {
          const tabId = tab?.id
          if (!tabId) return

          devLog('Tab created with ID:', tabId)

          // Wait for form elements to be ready
          const ready = await waitForElement(tabId, 'input[name="p_title"]')
          if (ready) {
            chrome.scripting.executeScript({
              target: { tabId },
              func: fillInitialForm,
            })
          }
        })
      })
    }

    // Return true to indicate that response will be sent asynchronously
    return true
  })

  // Listen for page navigation events to detect form expansion
  chrome.webNavigation.onCompleted.addListener(async (details) => {
    if (!details.url.startsWith('https://music.douban.com/new_subject')) return

    devLog('Navigation completed for URL:', details.url)

    const tabId = details.tabId
    if (typeof tabId !== 'number') return

    // Skip if form was already filled for this tab
    if (formFilledTabs.has(tabId)) {
      devLog('Tab', tabId, 'already had form filled, skipping')
      return
    }

    // Wait for artist input to appear (indicates form expanded)
    const ready = await waitForElement(tabId, '#p_48_0')
    if (ready) {
      // Mark tab as filled
      formFilledTabs.add(tabId)

      // Fill the expanded form
      chrome.scripting.executeScript({
        target: { tabId },
        func: fillRemainingForm,
      })
    }
  })
})

// Function to fill initial form with title and click expand button
function fillInitialForm() {
  const isDev = process.env.NODE_ENV !== 'production'
  const log = (...args: unknown[]) => isDev && console.log('[Neo2DB]', ...args)

  log('Executing fillInitialForm')
  chrome.storage.local.get(['pendingAlbumData'], (result) => {
    const albumData = result.pendingAlbumData as AlbumData
    if (!albumData) return

    const titleInput = document.querySelector('input[name="p_title"]') as HTMLInputElement
    const btnLink = document.querySelector('.btn-link') as HTMLElement

    if (titleInput && btnLink) {
      log('Form elements found, setting title:', albumData.title)
      titleInput.value = albumData.title
      log('Clicking button to proceed')
      btnLink.click()
    } else {
      console.error('[Neo2DB] Form elements not found!')
    }
  })
}

// Function to fill all remaining form fields after expansion
function fillRemainingForm() {
  const isDev = process.env.NODE_ENV !== 'production'
  const log = (...args: unknown[]) => isDev && console.log('[Neo2DB]', ...args)

  log('Executing fillRemainingForm')
  chrome.storage.local.get(['pendingAlbumData'], (result) => {
    const albumData = result.pendingAlbumData as AlbumData
    if (!albumData) return

    let fieldsFound = 0
    let fieldsTotal = 0

    // Fill artist field
    if (Array.isArray(albumData.artist)) {
      albumData.artist.forEach((artist: string, index: number) => {
        fieldsTotal++
        const artistInput = document.getElementById(`p_48_${index}`) as HTMLInputElement
        if (artistInput) {
          fieldsFound++
          artistInput.value = artist
          artistInput.dispatchEvent(new Event('input', { bubbles: true }))
        }
      })
    }

    // Fill company field
    const company = albumData.company?.[0] || ''
    if (company) {
      fieldsTotal++
      const companyInput = document.querySelector('input[name="p_50"]') as HTMLInputElement
      if (companyInput) {
        fieldsFound++
        companyInput.value = company.replace(/^\d{4}\s*/, '')
      }
    }

    // Fill release_date field
    const releaseDate = albumData.release_date || ''
    if (releaseDate) {
      fieldsTotal++
      const releaseDateInput = document.querySelector('input[name="p_51"]') as HTMLInputElement
      if (releaseDateInput) {
        fieldsFound++
        releaseDateInput.value = releaseDate
      }
    }

    // Fill track_list field
    const trackList = albumData.track_list || ''
    if (trackList) {
      fieldsTotal++
      const trackListInput = document.querySelector(
        'textarea[name="p_52_other"]'
      ) as HTMLTextAreaElement
      if (trackListInput) {
        fieldsFound++
        trackListInput.value = trackList
      }
    }

    // Fill description field
    const description = albumData.description || ''
    if (description) {
      fieldsTotal++
      const descriptionInput = document.querySelector(
        'textarea[name="p_28_other"]'
      ) as HTMLTextAreaElement
      if (descriptionInput) {
        fieldsFound++
        descriptionInput.value = description
      }
    }

    // Fill external_resources field
    const externalUrl = albumData.external_resources?.[0]?.url || ''
    if (externalUrl) {
      fieldsTotal++
      const externalUrlInput = document.querySelector(
        'textarea[name="p_152_other"]'
      ) as HTMLTextAreaElement
      if (externalUrlInput) {
        fieldsFound++
        externalUrlInput.value = externalUrl
      }
    }

    log(`Form filling completed: found ${fieldsFound}/${fieldsTotal} fields`)
    chrome.storage.local.remove('pendingAlbumData')
  })
}
