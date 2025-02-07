// Функция для генерации PAC-скрипта
function generatePacScript(host, port) {
  return `
    function FindProxyForURL(url, host) {
      return "PROXY ${host}:${port}; DIRECT";
    }
  `;
}

// Функция для установки прокси
function setProxy(host, port) {
  const pacScript = generatePacScript(host, port);
  const config = {
    mode: "pac_script",
    pacScript: {
      data: pacScript
    }
  };
  chrome.proxy.settings.set(
    { value: config, scope: 'regular' },
    function() {
      console.log("Прокси настроен через PAC-скрипт.");
    }
  );
}

// Переменные для хранения учетных данных прокси
let proxyUsername = "";
let proxyPassword = "";

// Обработка аутентификации прокси
chrome.webRequest.onAuthRequired.addListener(
  async function(details, asyncCallback) {
    if (proxyUsername && proxyPassword) {
      asyncCallback({
        authCredentials: {
          username: proxyUsername,
          password: proxyPassword
        }
      });
    } else {
      asyncCallback();
    }
  },
  { urls: ["<all_urls>"] },
  ['asyncBlocking']
);

// Обработка сообщений из popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateProxy") {
    const { host, port, login, password } = request.proxySettings;
    setProxy(host, port);
    proxyUsername = login;
    proxyPassword = password;
  } else if (request.action === "disableProxy") {
    chrome.proxy.settings.clear({ scope: 'regular' }, function() {
      console.log("Прокси отключен.");
    });
    proxyUsername = "";
    proxyPassword = "";
  }
});
