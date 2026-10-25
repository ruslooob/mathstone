# Mathstone

Локальное React-приложение на TypeScript для изучения математики и практики решения задач.

## Публикация сайта

Сайт: [Mathstone](https://ruslooob.github.io/mathstone/).

[GitHub Actions](.github/workflows/deploy-pages.yml) проверяет код, собирает сайт и публикует его в GitHub Pages после каждого push в `main`.
Деплой также можно запустить вручную из вкладки Actions для ветки `main`.
В настройках репозитория **Settings → Pages → Source** должен быть выбран **GitHub Actions**.
Путь публикации Vite получает из настроек GitHub Pages во время сборки.

## Документы и задачи

- [GLOSSARY.md](GLOSSARY.md) — понятия проекта.
- [CODING_STANDARDS.md](CODING_STANDARDS.md) — правила кода.
- [План проекта](https://github.com/ruslooob/mathstone/issues/1) — решения и дальнейшие направления.
- [Требования MVP](https://github.com/ruslooob/mathstone/issues/3) — согласованный объём первой версии.
- [Согласование словаря](https://github.com/ruslooob/mathstone/issues/9) — итог обсуждения и открытые вопросы.
- [package.json](package.json) и [Makefile](Makefile) — команды работы с проектом.

## Структура и история

- `src/` — компоненты React, состояние параграфов, SVG-схемы и стили.
- `checks/` — проверки воспроизведения и навигации.
