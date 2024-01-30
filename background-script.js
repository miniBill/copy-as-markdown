const browser = chrome || window["browser"];

function getText() {
  // https://stackoverflow.com/a/40087980/1181553
  var range = window.getSelection().getRangeAt(0); // Get the selected range
  var div = document.createElement("div");
  div.appendChild(range.cloneContents()); // Get the document fragment from selected range
  return div.innerHTML; // Return the actual HTML
}

async function writeToClipboard(text) {
  await navigator.clipboard.writeText(text);
}

/**
 * @param {string} text
 * @returns {string}
 */
function toMarkdown(text) {
  String.prototype.__replaceTag = function (tag, replacement) {
    return this.replaceAll(`<${tag}> `, ` ${replacement}`)
      .replaceAll(`<${tag}>`, replacement)
      .replaceAll(` </${tag}>`, `${replacement} `)
      .replaceAll(`</${tag}>`, replacement);
  };

  return text
    .replaceAll("</p>\n<p>", "\n> \n> ")
    .replaceAll(
      /<span style="text-decoration: underline;">([^<]*)<\/span>/g,
      (_, inner) => `__${inner}__`
    )
    .replaceAll(
      /<span style="text-decoration: line-through;">([^<]*)<\/span>/g,
      (_, inner) => `~~${inner}~~`
    )
    .replaceAll(
      /<span style="color: #[0-9a-f]*;">([^<]*)<\/span>/g,
      (_, inner) => inner
    )
    .replaceAll(
      /<a(?: title="[^"]*")? href="([^"]*)"(?: [a-z]*="[^"]*")*>([^<]*)<\/a>/g,
      (_, href, label) => `[${label}](${href})`
    )
    .replaceAll("&nbsp;", " ")
    .replaceAll("<br>", "\n> ")
    .__replaceTag("p", "")
    .__replaceTag("em", "_")
    .__replaceTag("s", "~~")
    .__replaceTag("i", "_")
    .__replaceTag("strong", "**")
    .__replaceTag("b", "**")
    .replaceAll(/^-/g, () => "\\-");
}

/** @param {chrome.tabs.Tab} tab  */
async function formattedCopy(tab) {
  const [{ result }] = await browser.scripting.executeScript({
    target: { tabId: tab.id },
    func: getText,
  });
  const formatted = `> ${toMarkdown(result.trim())}\n`;
  await browser.scripting.executeScript({
    target: { tabId: tab.id },
    func: writeToClipboard,
    args: [formatted],
  });
  console.log(formatted);
}

browser.runtime.onInstalled.addListener(() => {
  console.clear();

  browser.contextMenus.create({
    id: "copy-as-markdown",
    title: "Copy as Markdown",
    contexts: ["selection"],
  });
});

browser.commands.onCommand.addListener(async (command, tab) => {
  switch (command) {
    case "copy-as-markdown":
      await formattedCopy(tab);
      break;
  }
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  switch (info.menuItemId) {
    case "copy-as-markdown":
      await formattedCopy(tab);
      break;
  }
});
