.PHONY: start install lint typecheck test build preview
.DEFAULT_GOAL := start

start: install
	npm run dev

install: node_modules/.package-lock.json

node_modules/.package-lock.json: package.json package-lock.json
	npm ci

lint: install
	npm run lint

typecheck: install
	npm run typecheck

test: install
	npm test

build: install
	npm run build

preview: install
	npm run preview
