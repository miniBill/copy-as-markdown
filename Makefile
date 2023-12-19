.PHONY: all
all: copy-as-markdown.xpi

icons/%.png: icons/icon.svg
	inkscape -w $* -h $* $^ -o $@
	optipng -o7 $@

copy-as-markdown.xpi: manifest.json background-script.js icons/48.png icons/96.png
	zip -DXq9 $@ $^
