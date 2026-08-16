const enableToggleEl = document.getElementById('enableToggle');
const targetLangEl = document.getElementById('targetLang');
const onlyCommentsEl = document.getElementById('onlyComments');
const deeplEnabledEl = document.getElementById('deeplEnabled');
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
    deeplEnabled: deeplEnabledEl.checked,
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
deeplEnabledEl.addEventListener('change', () => {
  deeplApiKeyEl.disabled = !deeplEnabledEl.checked;
  autoSave();
});
deeplApiKeyEl.addEventListener('change', () => autoSave());
deeplApiKeyEl.addEventListener('input', () => {});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.deeplEnabled) {
    deeplEnabledEl.checked = changes.deeplEnabled.newValue;
    deeplApiKeyEl.disabled = !changes.deeplEnabled.newValue;
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const items = await chrome.storage.local.get({
    enabled: true,
    targetLang: 'zh-CN',
    onlyComments: false,
    deeplEnabled: true,
    deeplApiKey: '',
  });

  enableToggleEl.checked = items.enabled;
  targetLangEl.value = items.targetLang;
  onlyCommentsEl.checked = items.onlyComments;
  deeplEnabledEl.checked = items.deeplEnabled;
  deeplApiKeyEl.disabled = !items.deeplEnabled;
  deeplApiKeyEl.value = items.deeplApiKey;

  updateEnabledState();
  isLoading = false;
});
