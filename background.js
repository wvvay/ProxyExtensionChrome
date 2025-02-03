chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "enableProxy") {
        enableProxy();
    } else if (message.action === "disableProxy") {
        disableProxy();
    } else if (message.action === "updateProxy") {
        updateProxy(message.proxySettings);
    } else if (message.action === "updateSites") {
        updateSites(message.sites);
    }
});

const config = {
    mode: "fixed_servers",
    rules: {
        singleProxy: {
            scheme: "http",
            host: "168.80.202.131",
            port: 8000,
        },
        bypassList: [], // Убираем обходной список
    },
};

chrome.proxy.settings.set({ value: config, scope: "regular" }, () => {
    console.log("Proxy enabled");
});

function disableProxy() {
    chrome.proxy.settings.set({ value: { mode: "direct" }, scope: "regular" }, () => {
        console.log("Прокси выключен");
    });
}

function updateProxy(proxySettings) {
    chrome.storage.local.set({ proxySettings }, () => {
        console.log("Настройки прокси обновлены");
    });
}

function updateSites(sites) {
    chrome.storage.local.set({ proxySites: sites }, () => {
        console.log("Список сайтов обновлен");
    });
}
