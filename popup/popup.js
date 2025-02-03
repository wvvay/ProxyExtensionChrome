document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.getElementById("toggleProxy");
    const saveBtn = document.getElementById("saveProxy");
    const addSiteBtn = document.getElementById("addSite");

    // Загружаем сохраненные настройки
    chrome.storage.local.get(["proxySettings", "proxyEnabled", "proxySites"], (data) => {
        if (data.proxySettings) {
            document.getElementById("proxyHost").value = data.proxySettings.host || "";
            document.getElementById("proxyPort").value = data.proxySettings.port || "";
            document.getElementById("proxyLogin").value = data.proxySettings.login || "";
            document.getElementById("proxyPassword").value = data.proxySettings.password || "";
            document.getElementById("currentProxy").textContent = `${data.proxySettings.host}:${data.proxySettings.port}`;
        }
        toggleBtn.textContent = data.proxyEnabled ? "Выключить прокси" : "Включить прокси";
        toggleBtn.classList.toggle("off", !data.proxyEnabled);

        if (data.proxySites) {
            updateSiteList(data.proxySites);
        }
    });

    // Включение/выключение прокси
    toggleBtn.addEventListener("click", () => {
        chrome.storage.local.get("proxyEnabled", (data) => {
            const newState = !data.proxyEnabled;
            chrome.storage.local.set({ proxyEnabled: newState }, () => {
                toggleBtn.textContent = newState ? "Выключить прокси" : "Включить прокси";
                toggleBtn.classList.toggle("off", !newState);
                chrome.runtime.sendMessage({ action: newState ? "enableProxy" : "disableProxy" });
            });
        });
    });

    // Сохранение прокси
    saveBtn.addEventListener("click", () => {
        const proxySettings = {
            host: document.getElementById("proxyHost").value,
            port: document.getElementById("proxyPort").value,
            login: document.getElementById("proxyLogin").value,
            password: document.getElementById("proxyPassword").value
        };

        chrome.storage.local.set({ proxySettings }, () => {
            document.getElementById("currentProxy").textContent = `${proxySettings.host}:${proxySettings.port}`;
            chrome.runtime.sendMessage({ action: "updateProxy", proxySettings });
        });
    });

    // Добавление сайтов
    addSiteBtn.addEventListener("click", () => {
        const siteInput = document.getElementById("siteInput").value.trim();
        if (!siteInput) return;

        chrome.storage.local.get("proxySites", (data) => {
            let sites = data.proxySites || [];
            if (!sites.includes(siteInput)) {
                sites.push(siteInput);
                chrome.storage.local.set({ proxySites: sites }, () => {
                    updateSiteList(sites);
                    chrome.runtime.sendMessage({ action: "updateSites", sites });
                });
            }
        });
    });

    // Обновление списка сайтов
    function updateSiteList(sites) {
        const siteList = document.getElementById("siteList");
        siteList.innerHTML = "";
        sites.forEach((site, index) => {
            const li = document.createElement("li");
            li.textContent = site;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "×";
            removeBtn.classList.add("remove-btn");
            removeBtn.addEventListener("click", () => {
                sites.splice(index, 1);
                chrome.storage.local.set({ proxySites: sites }, () => {
                    updateSiteList(sites);
                    chrome.runtime.sendMessage({ action: "updateSites", sites });
                });
            });

            li.appendChild(removeBtn);
            siteList.appendChild(li);
        });
    }
});
