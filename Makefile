.PHONY: all
all: copy-as-markdown-firefox.xpi copy-as-markdown-chrome.zip

icons/%.png: icons/icon.svg
	inkscape -w $* -h $* $^ -o $@
	optipng -o7 $@ -strip all

copy-as-markdown-firefox.xpi: manifest-firefox.json background-script.js icons/48.png icons/96.png
	zip -DXq9 $@ $^
	7z rn $@ manifest-firefox.json manifest.json


copy-as-markdown-chrome.zip: manifest-chrome.json background-script.js icons/48.png icons/96.png
	zip -DXq9 $@ $^
	7z rn $@ manifest-chrome.json manifest.json
