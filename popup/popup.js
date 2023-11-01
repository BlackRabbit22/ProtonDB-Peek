// hex coded tier colours
const tierColours = {
  platinum: "#b5c6dc",
  gold: "#ceb43b",
  silver: "#a7a7a6",
  bronze: "#ca7b34",
  borked: "#ff0000",
  pending: "#6e747b",
  unverified: "#34393f",
};

// get tier from protonDB API
chrome.runtime.sendMessage({ message: "getURL" }, (response) => {
  const url = response.url;
  const appID = url.split("/")[4];

  // handles popup for specific pages
  if (new RegExp("store.steampowered.com/app/*").test(url)) {
    fetch(chrome.runtime.getURL("../popup/popup2.html"))
      .then((response) => response.text())
      .then((text) => {
        chrome.storage.local.get([appID], (data) => {
          data = data[appID];
          text = text
            .replace("{{tier}}", data.tier.toUpperCase())
            .replace("{{tierColour}}", tierColours[data.tier])
            .replace(/{{score}}/g, Math.round(data.score * 100))
            .replace("{{circleColour}}", data.score > 0.5 ? "#64a757" : "#e05d44")
            .replace("{{native}}", data.native ? "NATIVE" : "NOT NATIVE")
            .replace("{{nativeColour}}", data.native ? "#679d1f" : "#e05d44")
            .replace("{{trendingTier}}", data.trendingTier.toUpperCase())
            .replace("{{trendingColour}}", tierColours[data.trendingTier]);
          document.getElementsByClassName("content")[0].innerHTML = text;
        });
      });
  } else {
    fetch(chrome.runtime.getURL("../popup/popup1.html"))
      .then((response) => response.text())
      .then((text) => {
        document.getElementsByClassName("content")[0].innerHTML = text;
      });
  }
});
