<template>
  <div>
    <h3>This page will download a dotLottie created in onMounted!</h3>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { DotLottie } from '@dotlottie/dotlottie-js';

defineProps<{ msg: string }>();

onMounted(() => {
  const createDotLottie = async () => {
    const dotlottie = new DotLottie();

    await dotlottie
      .addAnimation({
        id: 'animation_1',
        url: 'https://lottie.host/18b639d1-a200-4225-ba0e-3456d40f95a5/wlrsaqWa8r.json',
      })
      .addAnimation({
        id: 'animation_2',
        url: 'https://lottie.host/cf7b43d1-3d6b-407a-970b-6305b18bebfa/uB1Jboo1o1.json',
      })
      .build()
      .then((value) => {
        value.download('animation.lottie');
      });
  };

  createDotLottie();
});
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
