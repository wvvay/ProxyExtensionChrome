// Функция для генерации PAC-скрипта
function generatePacScript(host, port, proxySites = []) {
    const proxyExceptions = proxySites.map(site => `"${site}"`).join(", ");

    return `
        function FindProxyForURL(url, host) {
            var proxyExceptions = [${proxyExceptions}];
            for (var i = 0; i < proxyExceptions.length; i++) {
                if (dnsDomainIs(host, proxyExceptions[i])) {
                    return "DIRECT";
                }
            }
            return "PROXY ${host}:${port}; DIRECT";
        }
    `;
}


// Функция для установки прокси
function setProxy(host, port, proxySites) {
    const pacScript = generatePacScript(host, port, proxySites);
    const config = {
        mode: "pac_script",
        pacScript: { data: pacScript }
    };
    chrome.proxy.settings.set(
        { value: config, scope: 'regular' },
        function() {
            console.log("Прокси настроен через PAC-скрипт с исключениями:", proxySites);
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateProxy") {
        const { host, port, login, password } = request.proxySettings;
        const proxySites = request.proxySites || [];
        setProxy(host, port, proxySites);
        proxyUsername = login;
        proxyPassword = password;
    } else if (request.action === "disableProxy") {
        chrome.proxy.settings.set({ value: { mode: "direct" }, scope: 'regular' }, function() {
            console.log("Прокси полностью отключен.");
        });
        proxyUsername = "";
        proxyPassword = "";

        // Очищаемcookies
        chrome.browsingData.remove({
            "since": 0 // Очищаем все данные с момента первого использования браузера
        }, {
                "cookies": true,
    //          "cache": true,
    //          "history": true,
    //          "formData": true,
    //          "passwords": true,
    //          "downloads": true,
    //          "localStorage": true
        }, function() {
            console.log("Куки очищен.");
        });

//        // Дополнительно очищаем сохраненные данные авторизации
//        chrome.storage.local.remove(['proxyUsername', 'proxyPassword'], function() {
//            console.log("Данные авторизации очищены.");
//        });

    }
});
