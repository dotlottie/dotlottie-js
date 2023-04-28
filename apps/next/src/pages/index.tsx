/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottie as Dotlottiejs } from '@dotlottie/dotlottie-js';

import styles from '@/styles/Home.module.css';

export default function Home(): JSX.Element {
  const createDotLottie = async (): Promise<void> => {
    const dotlottie = new Dotlottiejs();

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
      .build()
      .then((value) => {
        value.download('animation.lottie');
      });
  };

  const callCreateDotLottie = (): void => {
    createDotLottie();
  };

  return (
    <>
      <main className={styles.main}>
        Download a dotLottie!
        <button onClick={callCreateDotLottie}>Create dotLottie</button>
      </main>
    </>
  );
}
