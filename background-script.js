const browser = window.chrome || window["browser"];

async function getCurrentTab() {
  // https://developer.chrome.com/docs/extensions/reference/api/tabs
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await browser.tabs.query(queryOptions);
  return tab;
}

function getText() {
  // https://stackoverflow.com/a/40087980/1181553
  var range = window.getSelection().getRangeAt(0); // Get the selected range
  var div = document.createElement("div");
  div.appendChild(range.cloneContents()); // Get the document fragment from selected range
  return div.innerHTML; // Return the actual HTML
}

function toMarkdown(text) {
  return text
    .replace("</p>\n<p>", "\n> \n> ")
    .replace("<p>", "")
    .replace("</p>", "")
    .replace("<em>", "_")
    .replace("</em>", "_");
}

async function formattedCopy() {
  const tab = await getCurrentTab();
  const [{ result }] = await browser.scripting.executeScript({
    target: { tabId: tab.id },
    func: getText,
  });
  const formatted = `> ${toMarkdown(result)}\n`;
  await navigator.clipboard.writeText(formatted);
  console.log(formatted);
}

browser.runtime.onInstalled.addListener((reason) => {
  browser.contextMenus.create({
    id: "formatted-copy",
    title: "Copy with Discord formatting",
    contexts: ["selection"],
  });

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    switch (info.menuItemId) {
      case "formatted-copy":
        await formattedCopy();
        break;
    }
  });

  browser.commands.onCommand.addListener(async (command) => {
    console.log(command);
    switch (command) {
      case "formatted-copy":
        await formattedCopy();
        break;
    }
  });
});
