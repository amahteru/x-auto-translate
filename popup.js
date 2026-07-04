/* global chrome */
const enableToggleEl = document.getElementById('enableToggle')
const targetLangEl = document.getElementById('targetLang')
const onlyCommentsEl = document.getElementById('onlyComments')
const statusEl = document.getElementById('status')
let isLoading = true

function showStatus (text) {
  statusEl.textContent = text
  statusEl.classList.add('visible')
  setTimeout(() => {
    statusEl.classList.remove('visible')
  }, 1500)
}

async function autoSave () {
  if (isLoading) return
  await chrome.storage.local.set({
    enabled: enableToggleEl.checked,
    targetLang: targetLangEl.value,
    onlyComments: onlyCommentsEl.checked
  })
  showStatus('已自动保存')
}

function updateEnabledState () {
  document.body.classList.toggle('disabled', !enableToggleEl.checked)
}

enableToggleEl.addEventListener('change', () => {
  updateEnabledState()
  autoSave()
})

targetLangEl.addEventListener('change', () => autoSave())
onlyCommentsEl.addEventListener('change', () => autoSave())

document.addEventListener('DOMContentLoaded', async () => {
  const settingsHeader = document.getElementById('settingsHeader')
  const settingsContent = document.getElementById('settingsContent')
  const settingsArrow = document.getElementById('settingsArrow')

  if (settingsHeader) {
    settingsHeader.addEventListener('click', () => {
      settingsContent.classList.toggle('open')
      settingsArrow.classList.toggle('open')
    })
  }

  const items = await chrome.storage.local.get({
    enabled: true,
    targetLang: 'zh-CN',
    onlyComments: false
  })

  enableToggleEl.checked = items.enabled
  targetLangEl.value = items.targetLang
  onlyCommentsEl.checked = items.onlyComments

  updateEnabledState()
  isLoading = false
})
