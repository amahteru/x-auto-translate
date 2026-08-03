/* global chrome */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    (async () => {
      try {
        const settings = await chrome.storage.local.get({ deeplApiKey: '' })
        const apiKey = settings.deeplApiKey ? settings.deeplApiKey.trim() : ''
        const text = request.text
        
        let translatedText = ''
        let detectedLang = 'unknown'

        if (apiKey) {
          const isFree = apiKey.endsWith(':fx')
          const endpoint = isFree ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate'
          
          let deeplTarget = request.targetLang.toUpperCase()
          if (deeplTarget === 'ZH-CN' || deeplTarget === 'ZH-TW') deeplTarget = 'ZH'
          if (deeplTarget === 'EN') deeplTarget = 'EN-US'

          const params = new URLSearchParams()
          params.append('text', text)
          params.append('target_lang', deeplTarget)

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': 'DeepL-Auth-Key ' + apiKey,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
          })

          if (!res.ok) {
            throw new Error('DeepL API failed: ' + res.status)
          }

          const deeplData = await res.json()
          if (deeplData && deeplData.translations && deeplData.translations.length > 0) {
            translatedText = deeplData.translations[0].text
            detectedLang = deeplData.translations[0].detected_source_language || 'unknown'
          }
        } else {
          const googleTarget = request.targetLang === 'zh-CN' ? 'zh-CN' : request.targetLang
          const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${googleTarget}&dt=t&q=${encodeURIComponent(text)}`)

          if (!res.ok) {
            throw new Error('Google Translation API failed with status ' + res.status)
          }

          const googleData = await res.json()

          if (googleData && googleData[0]) {
            googleData[0].forEach(item => {
              if (item[0]) {
                translatedText += item[0]
              }
            })
          }
          detectedLang = googleData[2] || 'unknown'
        }

        const data = [{
          translations: [{ text: translatedText }],
          detectedLanguage: { language: detectedLang.toLowerCase() }
        }]

        sendResponse({ success: true, data, provider: apiKey ? 'deepl' : 'google' })
      } catch (err) {
        sendResponse({ success: false, error: err.toString() })
      }
    })()
    return true
  }
})
