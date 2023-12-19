.PHONY: all
all: icons/48.png icons/96.png

icons/%.png: icons/icon.svg
	inkscape -w $* -h $* $^ -o $@
