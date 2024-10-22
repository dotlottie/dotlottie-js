<template>
  <div>
    Create a dotLottie!
    {{ animationData }}
    <button @click="createDotLottie()">Create Dot Lottie</button>
  </div>
</template>

<script lang="ts">
import { DotLottie } from '@dotlottie/dotlottie-js/v1';

export default {
  props: ['animationData'],

  methods: {
    createDotLottie() {
      const dotlottie = new DotLottie();

      dotlottie
        .setAuthor('Joe')
        .setVersion('1.0')
        .addAnimation({
          id: 'animation_1',
          url: 'https://lottie.host/18b639d1-a200-4225-ba0e-3456d40f95a5/wlrsaqWa8r.json',
          autoplay: true,
        })
        .addAnimation({
          id: 'animation_2',
          url: 'https://lottie.host/cf7b43d1-3d6b-407a-970b-6305b18bebfa/uB1Jboo1o1.json',
          autoplay: true,
        })
        .build()
        .then((value) => {
          value.download('animation.lottie');
        });
    },
  },
};
</script>
