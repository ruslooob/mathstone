.PHONY: start install typecheck test build preview
.DEFAULT_GOAL := start

start:
	node scripts/dev.mjs

install:
	node scripts/install.mjs

typecheck: install
	npm run typecheck

test: install
	npm test

build: install
	npm run build

preview: install
	npm run preview
