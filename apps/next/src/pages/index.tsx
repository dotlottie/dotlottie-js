/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottie as Dotlottiejs } from '@dotlottie/dotlottie-js';

import styles from '@/styles/Home.module.css';

export default function Home(): JSX.Element {
  const createDotLottie = async (): Promise<void> => {
    const dotlottie = new Dotlottiejs();

    await dotlottie
      .addAnimation({
        id: 'animation_1',
        url: 'https://assets10.lottiefiles.com/packages/lf20_ukjcyybw.json',
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
