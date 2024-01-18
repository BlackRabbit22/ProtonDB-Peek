// get appID from URL
const appID = window.location.href.split("/")[4];

// SVG badges
const tierBadges = {
  platinum: "../badges/platinum.svg",
  gold: "../badges/gold.svg",
  silver: "../badges/silver.svg",
  bronze: "../badges/bronze.svg",
  borked: "../badges/borked.svg",
  pending: "../badges/pending.svg",
  unverified: "../badges/unverified.svg",
};

const nativeBadge = {
  nativeYes: "../badges/native-yes.svg",
  nativeNo: "../badges/native-no.svg",
};

// add HTML elements to page
const decorate = (tierBadge, protonDBHref, nativeBadge, reviewCount) => {
  let userReviewTab = document.getElementsByClassName("user_reviews")[0];
  let protonTier = new DOMParser().parseFromString(
    DOMPurify.sanitize(
      `
  <div id="protonDB-Peek">
  <div id="protonDB" class="dev_row">
    <div class="subtitle column">ProtonDB:</div>
    <div data-tooltip-html="Total reports: ${reviewCount}" class="summary column">
      <a href="${protonDBHref}" target="_blank">
        <img src="${tierBadge}" />
      </a>
    </div>
  </div>
  
  <div id="linux-support" class="dev_row">
    <div class="subtitle column">Linux Support:</div>
    <div class="summary column">
      <div id="requirementsBtn" style="cursor: pointer">
        <img src="${nativeBadge}" />
      </div>
    </div>
  </div>
</div>
`,
      {
        ADD_ATTR: ["target", "src"],
        ALLOWED_URI_REGEXP:
          /^(?:(?:https|chrome-extension|moz-extension):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      }
    ),
    "text/html"
  );

  userReviewTab.appendChild(protonTier.body.firstChild);
  document.getElementById("requirementsBtn").addEventListener("click", function () {
    let linuxTab = document.querySelector('[data-os="linux"]');

    if (linuxTab !== null) linuxTab.click();
    document.querySelector("div.game_page_autocollapse.sys_req").scrollIntoView();
  });
};

// check if title runs natively on linux
const isNative = () => {
  return document.querySelector('[data-os="linux"]') !== null;
};

// return native badge
const getNativeBadge = () => {
  if (isNative()) return nativeBadge.nativeYes;

  return nativeBadge.nativeNo;
};

// get tier from protonDB API
chrome.runtime.sendMessage({ message: "getTier", appID: appID }, (response) => {
  const pDBData = response.pDBData;
  console.log(pDBData);

  const reviewCount = pDBData.total;
  const tierBadge = chrome.runtime.getURL(tierBadges[pDBData.tier]);
  const protonDBHref = `https://www.protondb.com/app/${appID}`;
  const nativeBadge = chrome.runtime.getURL(getNativeBadge());

  decorate(tierBadge, protonDBHref, nativeBadge, reviewCount);
  chrome.runtime.sendMessage({ message: "setNative", appID: appID, native: isNative() });
});
