// clear on browser startup
chrome.runtime.onStartup.addListener(() => {
  clearCachedDB();
});

// set alarm to clear cache each 30 minutes
chrome.alarms.create({ delayInMinutes: 30 });
chrome.alarms.onAlarm.addListener(() => {
  clearCachedDB();
});

// clear cached titles
const clearCachedDB = () => {
  chrome.storage.local.clear();
};

// get tier from protonDB API
const getTier = (appID) => {
  const apiURL = `https://www.protondb.com/api/v1/reports/summaries/${appID}.json`;
  return new Promise((resolve) => {
    chrome.storage.local.get(appID, (storData) => {
      // if data not in local storage, retrieve from API
      if (Object.entries(storData).length === 0) {
        fetch(apiURL, { signal: AbortSignal.timeout(1000) })
          .then((response) => {
            // if API returns 404 then set as unverified
            if (response.status === 404)
              return {
                tier: "unverified",
                total: "0",
                score: "0.00",
                trendingTier: "unverified",
              };
            return response.json();
          })
          .then((data) => {
            chrome.storage.local.set({ [appID]: data });
            resolve(data);
          })
          .catch((error) => {
            resolve(error);
          });
      } else {
        resolve(storData[appID]);
      }
    });
  }).catch((error) => console.log(error));
};

// retrieve the url from the active tab
const tabURL = () => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      resolve(tabs[0].url);
    });
  });
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "getTier") {
    getTier(request.appID).then((data) => {
      sendResponse({ pDBData: data });
    });

    return true;
  } else if (request.message === "getURL") {
    tabURL().then((data) => {
      sendResponse({ url: data });
    });

    return true;
  } else if (request.message === "setNative") {
    const appID = request.appID;

    chrome.storage.local.get(appID, (data) => {
      const native = request.native;
      data[appID]["native"] = native;

      chrome.storage.local.set({ [appID]: data[appID] });

      return true;
    });
  }
});
