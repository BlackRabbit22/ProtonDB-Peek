// get tier from protondb API
const getTier = (appID) => {
  const apiURL = `https://www.protondb.com/api/v1/reports/summaries/${appID}.json`;
  return new Promise((resolve) => {
    chrome.storage.local.get(appID, (storData) => {
      // if data not in local storage, retrieve from API
      if (typeof storData.tier === "undefined") {
        fetch(apiURL)
          .then((response) => {
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
          });
      } else {
        resolve(storData);
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
