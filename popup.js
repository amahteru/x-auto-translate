const enableToggleEl = document.getElementById('enableToggle');
const targetLangEl = document.getElementById('targetLang');
const onlyCommentsEl = document.getElementById('onlyComments');
const deeplApiKeyEl = document.getElementById('deeplApiKey');
const statusEl = document.getElementById('status');
let isLoading = true;
let statusTimeoutId = null;

function showStatus(text) {
  if (statusTimeoutId) {
    clearTimeout(statusTimeoutId);
  }
  statusEl.textContent = text;
  statusEl.classList.add('visible');
  statusTimeoutId = setTimeout(() => {
    statusEl.classList.remove('visible');
    statusTimeoutId = null;
  }, 1500);
}

async function autoSave() {
  if (isLoading) return;
  await chrome.storage.local.set({
    enabled: enableToggleEl.checked,
    targetLang: targetLangEl.value,
    onlyComments: onlyCommentsEl.checked,
    deeplApiKey: deeplApiKeyEl.value,
  });
  showStatus('已自动保存');
}

function updateEnabledState() {
  document.body.classList.toggle('disabled', !enableToggleEl.checked);
}

enableToggleEl.addEventListener('change', () => {
  updateEnabledState();
  autoSave();
});

targetLangEl.addEventListener('change', () => autoSave());
onlyCommentsEl.addEventListener('change', () => autoSave());
deeplApiKeyEl.addEventListener('change', () => autoSave());
deeplApiKeyEl.addEventListener('input', () => {
  // autoSave is debounced via change event, but we can also trigger on input if we want, or just wait for blur
});

document.addEventListener('DOMContentLoaded', async () => {
  const settingsHeader = document.getElementById('settingsHeader');
  const settingsContent = document.getElementById('settingsContent');
  const settingsArrow = document.getElementById('settingsArrow');

  if (settingsHeader) {
    settingsHeader.addEventListener('click', () => {
      settingsContent.classList.toggle('open');
      settingsArrow.classList.toggle('open');
    });
  }

  const items = await chrome.storage.local.get({
    enabled: true,
    targetLang: 'zh-CN',
    onlyComments: false,
    deeplApiKey: '',
  });

  enableToggleEl.checked = items.enabled;
  targetLangEl.value = items.targetLang;
  onlyCommentsEl.checked = items.onlyComments;
  deeplApiKeyEl.value = items.deeplApiKey;

  updateEnabledState();
  isLoading = false;
});
