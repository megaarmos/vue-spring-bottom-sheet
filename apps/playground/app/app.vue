<script setup>
useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title: 'Vue Spring Bottom Sheet',
  description:
    'Beautifully designed Nuxt Content template built with shadcn-vue. Customizable. Compatible. Open Source.',
  ogTitle: 'Vue Spring Bottom Sheet',
  ogDescription:
    'Beautifully designed Nuxt Content template built with shadcn-vue. Customizable. Compatible. Open Source.',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UHeader title="Bottom Sheet">
      <ul class="grid gap-4 grid-cols-2 lg:grid-cols-4 justify-between text-sm lg:text-base">
        <li class="flex justify-center">
          <ULink to="/">Basic</ULink>
        </li>
        <li class="flex justify-center">
          <ULink to="/snap">Snap point & content drag</ULink>
        </li>
        <li class="flex justify-center">
          <ULink to="/sticky">Sticky Header & Footer</ULink>
        </li>
        <li class="flex justify-center">
          <ULink to="/blocking">Non-blocking mode</ULink>
        </li>
      </ul>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator icon="i-simple-icons-nuxtdotjs" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Built with Nuxt UI • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          variant="ghost"
          target="_blank"
          aria-label="GitHub"
          icon="i-simple-icons-github"
          to="https://github.com/nuxt-ui-templates/starter"
          color="neutral"
        />
      </template>
    </UFooter>
  </UApp>
</template>
