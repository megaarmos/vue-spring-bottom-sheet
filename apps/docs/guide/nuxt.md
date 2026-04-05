# Nuxt Integration

Learn how to use Vue Spring Bottom Sheet in your Nuxt 3 application.

## Installation

Install the package using your preferred package manager:

:::code-group

```sh [npm]
npm install @opekunov/vue-spring-bottom-sheet
```

```sh [yarn]
yarn add @opekunov/vue-spring-bottom-sheet
```

```sh [pnpm]
pnpm add @opekunov/vue-spring-bottom-sheet
```

```sh [bun]
bun add @opekunov/vue-spring-bottom-sheet
```

:::

## Basic Usage

### Using ClientOnly

Since Bottom Sheet relies on browser APIs, wrap it in `<ClientOnly>` for SSR compatibility:

```vue
<script setup>
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'
import '@opekunov/vue-spring-bottom-sheet/dist/style.css'
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')
</script>

<template>
  <div>
    <button @click="bottomSheet?.open()">Open Sheet</button>

    <ClientOnly>
      <BottomSheet ref="bottomSheet">
        <h2>Hello from Nuxt!</h2>
        <p>This works perfectly with SSR.</p>
      </BottomSheet>
    </ClientOnly>
  </div>
</template>
```

::: tip Why ClientOnly?
The component uses browser-specific APIs like `window`, `document`, and touch events that aren't available during server-side rendering. `<ClientOnly>` ensures the component only renders on the client side.
:::

## Creating a Plugin

For easier usage across your app, create a Nuxt plugin:

### 1. Create Plugin File

```ts
// plugins/bottom-sheet.client.ts
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'
import '@opekunov/vue-spring-bottom-sheet/dist/style.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('BottomSheet', BottomSheet)
})
```

::: warning File Naming
Note the `.client.ts` suffix—this ensures the plugin only runs on the client side.
:::

### 2. Use Globally

Now you can use it without importing:

```vue
<script setup>
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')
</script>

<template>
  <button @click="bottomSheet.open()">Open</button>

  <ClientOnly>
    <BottomSheet ref="bottomSheet"> Content here </BottomSheet>
  </ClientOnly>
</template>
```
