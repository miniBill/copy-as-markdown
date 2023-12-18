const browser = window.chrome || window["browser"];

browser.contextMenus.create(
  {
    id: "copyWithFormatting",
    title: "Copy with Discord formatting",
    contexts: ["selection"],
  },
  () => void browser.runtime.lastError
);

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  switch (info.menuItemId) {
    case "copyWithFormatting":
      const text = info.selectionText;
      await navigator.clipboard.writeText(text);
      break;
  }
});
