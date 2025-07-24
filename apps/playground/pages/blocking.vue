<script lang="ts" setup>
import { ref, version } from 'vue'

import BottomSheet from '../../../packages/vue-spring-bottom-sheet'
import '../../../packages/vue-spring-bottom-sheet/dist/style.css'

const bottomSheet = ref<InstanceType<typeof BottomSheet>>()
const open = ref(false)

const toggle = () => {
  open.value = !open.value

  if (open.value) {
    bottomSheet.value?.open()
  } else {
    bottomSheet.value?.close()
  }
}

const snapToPoint = (index: number) => {
  bottomSheet.value?.snapToPoint(index)
}
</script>

<template>
  <div class="content" id="content">
    <div class="mb-8 space-y-4">
      <UButton type="button" @click="toggle">{{ open ? 'Close' : 'Open' }} bottom sheet</UButton>
      <p>vue js: {{ version }}</p>
    </div>
    <p class="max-w-xl px-5">
      Example content to make the page scrollable... Lorem, ipsum dolor sit amet consectetur
      adipisicing elit. Recusandae sint cupiditate eum quibusdam consequuntur quae! Rem error alias
      placeat aliquid qui facere dicta veniam tenetur suscipit? Quibusdam eos est similique
      excepturi officiis sequi maxime sunt blanditiis nulla aperiam rem cum totam eligendi eius
      voluptatem, dolores repellendus! Iste accusantium vero, sint ipsam dicta saepe laudantium
      blanditiis et corporis aliquid deleniti quae vitae nostrum, repellat illo explicabo accusamus
      odit pariatur ex. Placeat dolorum in laboriosam repudiandae maiores aut incidunt eos sequi
      consectetur, autem nihil. Quae corrupti veritatis voluptates molestiae ipsam beatae sit quia
      aperiam rem! Natus earum quas, quos rerum nisi nostrum deserunt voluptatibus perspiciatis?
      Hic, animi harum quam, fugit explicabo ab accusantium laborum iste rem omnis obcaecati quis
      earum eligendi in inventore, mollitia asperiores numquam amet architecto porro at! Minus, non
      porro. Harum dolor nihil nemo quisquam! Omnis ipsum deleniti id laborum incidunt temporibus,
      ipsa suscipit eius dolorum voluptatem aut, voluptas a provident tempore. Voluptas asperiores
      ea delectus. Ipsa laborum error numquam perferendis similique voluptates animi suscipit dolore
      at modi dicta minima, asperiores corporis nemo, voluptate repellendus, aspernatur illo quo.
      Aliquid voluptatem excepturi odio accusamus dignissimos expedita eveniet, impedit consequatur.
      Illo fugit placeat possimus est doloremque? Veritatis quidem, similique sed non sint
      architecto aliquam doloribus accusamus aspernatur fugit corporis quae voluptates maxime at.
      Aut praesentium, quia architecto ea natus dicta nihil laborum tempora animi quas voluptas
      recusandae adipisci nostrum vero amet, nisi temporibus fugit sequi beatae. Natus fugiat ullam
      nemo neque laborum nesciunt, iure totam aut doloribus ea! Fugiat similique eos vel dicta
      maxime? Cumque hic perferendis accusantium molestias laboriosam quod consequuntur, cupiditate
      fuga accusamus cum explicabo, magni enim nobis velit numquam atque! Maxime et explicabo velit
      distinctio! Quis ad, ipsa eaque iusto adipisci laboriosam fugiat nihil blanditiis explicabo
      fugit repudiandae. Quaerat odio porro doloribus? Perferendis, sit blanditiis. Ab, eligendi
      impedit. Consectetur, officia provident! Sed dignissimos suscipit consequuntur fugit ullam
      odio incidunt quo sint enim. Ratione modi aperiam rem non quaerat consectetur, natus maiores
      impedit et exercitationem, suscipit facilis debitis, mollitia in molestiae sunt sit cum optio
      laboriosam? Fugit officia consequuntur eos voluptate, quo dicta quas! In nulla sapiente
      cupiditate sequi! Animi culpa cumque, et voluptas, autem odio tenetur iusto quas amet quidem
      ipsam quos dicta dolorem libero, expedita minima maiores exercitationem esse eos. Vero cumque
      molestias porro iusto neque, officiis quaerat nemo. Sunt atque corrupti nobis id sapiente
      quidem. Animi officiis corrupti dicta, excepturi, quod, reprehenderit nam sint accusamus
      deserunt obcaecati beatae illum ipsum minus nisi necessitatibus omnis aspernatur eligendi
      saepe aliquid aperiam. Ipsam, perspiciatis? Temporibus iure cumque optio accusamus itaque
      laboriosam nemo facilis earum, asperiores libero. Quia eveniet inventore asperiores fuga
      impedit deserunt iure magni ipsam tenetur. Eos omnis officia unde quisquam natus eius beatae
      aperiam. Facilis vitae veniam aut ducimus consequatur excepturi labore modi dolorum eveniet?
      Ex maxime placeat dolore minima hic at necessitatibus similique voluptatem facilis, ipsa nisi
      nihil tempora nemo mollitia nulla dolorum dolor fuga cupiditate veniam assumenda, voluptas,
      aspernatur nobis! Minima magni perspiciatis doloribus officia veritatis, ratione, quas dolore
      eos impedit numquam doloremque ex delectus!
    </p>
  </div>
  <ClientOnly>
    <BottomSheet
      ref="bottomSheet"
      :blocking="false"
      :snap-points="['25%', '60%']"
      @closed="open = false"
      @vue:mounted="toggle()"
    >
      <template #header>
        <UInput type="text" placeholder="Search..." class="w-full" />
      </template>
      <div class="button-group">
        <UButton type="button" @click="snapToPoint(1)">Top</UButton>
        <UButton type="button" @click="snapToPoint(0)">Bottom</UButton>
      </div>
      <p v-for="i in 3" class="mb-4" :key="i">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste aperiam, accusamus amet
        veniam officiis libero necessitatibus ipsum, reprehenderit eveniet neque ad delectus fugit!
      </p>
    </BottomSheet>
  </ClientOnly>
</template>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.button-group button {
  flex: 1 1 33%;
}

#app {
  padding: 0;
  width: 100%;
}
</style>
