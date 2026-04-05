<p align="center">
  <h1 align="center">Vue Spring Bottom Sheet</h1>
  <p align="center">Современный и производительный компонент bottom sheet для Vue 3 с пружинной физикой, морфингом и жестами</p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@opekunov/vue-spring-bottom-sheet"><img src="https://img.shields.io/npm/v/@opekunov/vue-spring-bottom-sheet.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@opekunov/vue-spring-bottom-sheet"><img src="https://img.shields.io/npm/dm/@opekunov/vue-spring-bottom-sheet.svg" alt="npm downloads"></a>
  <a href="https://github.com/opekunov/vue-spring-bottom-sheet/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@opekunov/vue-spring-bottom-sheet.svg" alt="license"></a>
</p>

<p align="center">
  <a href="#возможности">Возможности</a> &bull;
  <a href="#демо">Демо</a> &bull;
  <a href="#установка">Установка</a> &bull;
  <a href="#использование">Использование</a> &bull;
  <a href="#api">API</a> &bull;
  <a href="#стилизация">Стилизация</a>
</p>

> Основан на [megaarmos/vue-spring-bottom-sheet](https://github.com/megaarmos/vue-spring-bottom-sheet)

**[English](./README.md)** | **Русский**

---

## Возможности

- Пружинная физика анимаций (настраиваемые масса, жесткость, затухание)
- Морфинг в стиле iOS (компактный -> развернутый -> полноэкранный)
- Жесты перетаскивания с определением скорости свайпа
- Точки привязки (пиксели или проценты)
- Поддержка v-model
- Доступность с клавиатуры (фокус-ловушка)
- Поддержка телепорта
- Блокировка прокрутки фона
- Слоты: header, content, footer
- CSS-переменные для кастомизации
- Полная поддержка TypeScript
- Vue 3.3+

## Демо

**[Живые примеры](https://opekunov.github.io/vue-spring-bottom-sheet/)**

## Установка

```bash
# npm
npm install @opekunov/vue-spring-bottom-sheet

# bun
bun add @opekunov/vue-spring-bottom-sheet

# yarn
yarn add @opekunov/vue-spring-bottom-sheet

# pnpm
pnpm add @opekunov/vue-spring-bottom-sheet
```

## Использование

### Базовое

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'
import '@opekunov/vue-spring-bottom-sheet/dist/style.css'

const sheet = useTemplateRef('sheet')
</script>

<template>
  <button @click="sheet?.open()">Открыть</button>

  <BottomSheet ref="sheet">
    Ваш контент
  </BottomSheet>
</template>
```

### С v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'
import '@opekunov/vue-spring-bottom-sheet/dist/style.css'

const isOpen = ref(false)
</script>

<template>
  <button @click="isOpen = true">Открыть</button>
  <BottomSheet v-model="isOpen">Контент</BottomSheet>
</template>
```

### Точки привязки

```vue
<BottomSheet ref="sheet" :snap-points="[200, '50%', '100%']" :initial-snap-point="0">
  Контент с тремя позициями привязки
</BottomSheet>
```

### Пружинная физика

```vue
<BottomSheet ref="sheet" :spring-config="{ mass: 1, stiffness: 300, damping: 30 }">
  Пружинная анимация
</BottomSheet>
```

### Морфинг (стиль iOS)

Требует минимум 2 точки привязки (лучше 3: компактный / развернутый / полноэкранный).

```vue
<BottomSheet
  ref="sheet"
  :snap-points="['25%', '50%', '100%']"
  :morphing="{ compactHorizontalInset: 16, compactBottomInset: 16, compactCornerRadius: 20 }"
>
  Морфинг из плавающей карточки в полноэкранный режим
</BottomSheet>
```

### Слоты

```vue
<BottomSheet ref="sheet">
  <template #header>Заголовок</template>
  Основной контент
  <template #footer>Подвал</template>
</BottomSheet>
```

### Слот Cover

Полноразмерный фон под header/content/footer (фото, градиент, карта):

```vue
<BottomSheet ref="sheet" :snap-points="[300, '60%', '100%']" :morphing="true">
  <template #cover>
    <img src="/profile-bg.jpg" style="width: 100%; height: 100%; object-fit: cover" />
  </template>
  <template #header>
    <h3 style="color: white">Профиль</h3>
  </template>
  Контент поверх фонового изображения
</BottomSheet>
```

### Nuxt

Оберните в `<ClientOnly>`:

```vue
<ClientOnly>
  <BottomSheet ref="sheet">Контент</BottomSheet>
</ClientOnly>
```

## API

### Пропсы

| Проп | Тип | По умолчанию | Описание |
|---|---|---|---|
| `duration` | `number` | `250` | Длительность анимации (мс) |
| `snapPoints` | `Array<number \| '${number}%'>` | `[instinctHeight]` | Позиции привязки |
| `initialSnapPoint` | `number` | `0` | Начальный индекс привязки |
| `blocking` | `boolean` | `true` | Блокировка фона |
| `canSwipeClose` | `boolean` | `true` | Закрытие свайпом |
| `swipeCloseThreshold` | `number \| string` | `'50%'` | Порог для закрытия |
| `canBackdropClose` | `boolean` | `true` | Закрытие по тапу на фон |
| `expandOnContentDrag` | `boolean` | `true` | Раскрытие перетаскиванием |
| `teleportTo` | `string \| RendererElement` | `'body'` | Цель телепорта |
| `teleportDefer` | `boolean` | `false` | Отложенный телепорт (Vue 3.5+) |
| `forceMount` | `boolean` | `false` | Держать в DOM при закрытии |
| `sheetClass` | `string` | `''` | CSS-класс контейнера шита |
| `headerClass` | `string` | `''` | CSS-класс заголовка |
| `contentClass` | `string` | `''` | CSS-класс контента |
| `footerClass` | `string` | `''` | CSS-класс подвала |
| `scrollClass` | `string` | `''` | CSS-класс скролл-контейнера |
| `morphing` | `boolean \| MorphingConfig` | `false` | Морфинг в стиле iOS |
| `springConfig` | `SpringConfig` | `undefined` | Настройки пружинной физики |
| `modelValue` | `boolean` | `undefined` | Привязка v-model |

> Интерактивные элементы (input, textarea и т.д.) внутри шита сохраняют стандартное поведение. Используйте атрибут `data-vsbs-no-drag` чтобы отключить перетаскивание на кастомных элементах.

### Методы

| Метод | Описание |
|---|---|
| `open()` | Открыть шит |
| `close()` | Закрыть шит |
| `snapToPoint(index)` | Перейти к точке привязки |

### События

| Событие | Payload | Описание |
|---|---|---|
| `opened` | - | Шит открылся |
| `opening-started` | - | Начало открытия |
| `closed` | - | Шит закрылся |
| `closing-started` | - | Начало закрытия |
| `dragging-up` | - | Перетаскивание вверх |
| `dragging-down` | - | Перетаскивание вниз |
| `snapped` | `index: number` | Привязка к точке |
| `instinctHeight` | `height: number` | Изменение высоты контента |

## Стилизация

Все стили библиотеки обёрнуты в `@layer vsbs` — ваш CSS всегда побеждает без `!important`.

### CSS-переменные

```css
[data-vsbs-sheet] {
  /* Цвета */
  --vsbs-backdrop-bg: rgba(0, 0, 0, 0.5);
  --vsbs-background: #fff;
  --vsbs-shadow-color: rgba(89, 89, 89, 0.2);
  --vsbs-border-color: rgba(46, 59, 66, 0.125);
  --vsbs-outer-border-color: transparent;

  /* Размеры */
  --vsbs-border-radius: 16px;
  --vsbs-max-width: 640px;
  --vsbs-padding-x: 16px;

  /* Ручка перетаскивания */
  --vsbs-handle-background: rgba(0, 0, 0, 0.28);
  --vsbs-handle-width: 36px;
  --vsbs-handle-height: 4px;
  --vsbs-handle-top: 8px;
  --vsbs-handle-radius: 2px;

  /* Отступы секций */
  --vsbs-header-padding: 20px var(--vsbs-padding-x, 16px) 8px;
  --vsbs-footer-padding: 16px var(--vsbs-padding-x, 16px);
  --vsbs-content-padding: 8px var(--vsbs-padding-x, 16px);
  --vsbs-content-display: grid;
}
```

### Прямое переопределение селекторов

Благодаря `@layer vsbs` любой ваш CSS автоматически побеждает:

```css
[data-vsbs-header]::before {
  width: 48px;
  height: 6px;
}

[data-vsbs-content] {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
```

### Справочник data-атрибутов

| Атрибут | Элемент |
|---|---|
| `data-vsbs-sheet` | Контейнер шита |
| `data-vsbs-backdrop` | Оверлей фона |
| `data-vsbs-header` | Заголовок (с ручкой) |
| `data-vsbs-scroll` | Скролл-контейнер |
| `data-vsbs-content` | Область контента |
| `data-vsbs-footer` | Подвал |
| `data-vsbs-cover` | Контейнер слота cover |
| `data-vsbs-morphing` | Добавляется при морфинге |
| `data-vsbs-shadow` | Добавляется в non-blocking |

## Лицензия

[MIT](./LICENSE)
