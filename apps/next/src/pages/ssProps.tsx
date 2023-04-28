/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottie } from '@dotlottie/dotlottie-js/node';

import styles from '@/styles/Home.module.css';

interface Props {
  dotLottieJson: unknown | undefined;
}

export async function getServerSideProps(): Promise<{
  props: {
    dotLottieJson: unknown | undefined;
  };
}> {
  const dotlottie = new DotLottie();

  await dotlottie
    .setAuthor('Joe')
    .setVersion('1.0')
    .addAnimation({
      id: 'animation_1',
      // eslint-disable-next-line no-secrets/no-secrets
      url: 'https://lottie.host/18b639d1-a200-4225-ba0e-3456d40f95a5/wlrsaqWa8r.json',
      autoplay: true,
    })
    .addAnimation({
      id: 'animation_2',
      url: 'https://lottie.host/cf7b43d1-3d6b-407a-970b-6305b18bebfa/uB1Jboo1o1.json',
      autoplay: true,
    })
    .build();

  const animation = await dotlottie.getAnimation('animation_1');
  let dotLottieJson = {};

  if (animation) {
    dotLottieJson = await animation.toJSON();
  }

  return {
    props: { dotLottieJson },
  };
}

export default function ssProps({ dotLottieJson }: Props): JSX.Element {
  return (
    <>
      <main className={styles.main}>
        Received from getServerSideProps:
        {JSON.stringify(dotLottieJson)}
      </main>
    </>
  );
}
