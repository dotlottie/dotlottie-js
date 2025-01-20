/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottie } from '@dotlottie/dotlottie-js';
import type { NextApiRequest, NextApiResponse } from 'next';

interface Data {
  dotLottie: Buffer | null;
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse<Data>): Promise<void> {
  const dotLottie = new DotLottie();
  let dotLottieAsBuffer = null;

  await dotLottie
    .addAnimation({
      id: 'animation_1',
      // eslint-disable-next-line no-secrets/no-secrets
      url: 'https://lottie.host/18b639d1-a200-4225-ba0e-3456d40f95a5/wlrsaqWa8r.json',
    })
    .addAnimation({
      id: 'animation_2',
      url: 'https://lottie.host/cf7b43d1-3d6b-407a-970b-6305b18bebfa/uB1Jboo1o1.json',
    })
    .build()
    .then(async (value) => {
      dotLottieAsBuffer = await value.toArrayBuffer();

      res.end(Buffer.from(dotLottieAsBuffer));
    });
}
