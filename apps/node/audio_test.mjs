/**
 * Copyright 2023 Design Barn Inc.
 */

/**
 * Current status:
 *  - Exporting correctly as a dotLottie
 *  - todo: test if it plays
 *  - todo: multi asset support
 */

import fs from 'fs';

import { DotLottie } from '@dotlottie/dotlottie-js/v1/node';
import { getAnimation, getAudio, getAllAudio } from '@dotlottie/dotlottie-js/v1/node';

// const dotLottie = new DotLottie();

// const dl = await
//     dotLottie
//         .setAuthor('Sam!')
//         .setVersion('1.0')
//         .addAnimation({
//             id: 'audio',
//             // url: 'https://assets10.lottiefiles.com/packages/lf20_tykuirhr.json',
//             url: 'https://lottie.host/d9f7a848-50ab-4d42-805f-0e5a5f686ebe/6JE9gErlEZ.json'
//         })
//         .build()
//         .then((value) => {
//             return value.toArrayBuffer();
//         })
//         .then(async (value) => {
//             const filename = 'multiple_audio.lottie';

//             console.log('> Writing to file: ', filename);

//             fs.writeFileSync(filename, Buffer.from(value));

//             console.log('> Writing inlined file from getAnimation 🪄');

//             const anim = await getAnimation(new Uint8Array(value), 'audio', {
//                 inlineAssets: true
//             });

//             fs.writeFileSync("audio_inlined.json", JSON.stringify(anim));

//             // -------–––-------–––-------–––-------–––-------–––-------–––

//             console.log('> Using DotLottie.fromArrayBuffer 🪄');

//             let ad = new DotLottie();

//             ad = await ad.fromArrayBuffer(value);

//             fs.writeFileSync("audio_inlined_from_array.json", Buffer.from(await ad.toArrayBuffer()));

//             // console.log(ad);
//             // console.log("\n\n\n\n\n")

//             // console.log(await ad.getAnimation('audio'));
//             // console.log(await ad.getAnimation('audio').audioAssets);
//         });

const double = new DotLottie();

const doubleAnimation = await double
  .setAuthor('Sam!')
  .setVersion('1.0')
  .addAnimation({
    id: 'audio_0',
    // url: 'https://assets10.lottiefiles.com/packages/lf20_tykuirhr.json',
    url: 'https://lottie.host/d9f7a848-50ab-4d42-805f-0e5a5f686ebe/6JE9gErlEZ.json',
  })
  .addAnimation({
    id: 'audio_1',
    // url: 'https://assets10.lottiefiles.com/packages/lf20_tykuirhr.json',
    // url: 'https://lottie.host/d9f7a848-50ab-4d42-805f-0e5a5f686ebe/6JE9gErlEZ.json'
    url: 'https://lottie.host/a9b21c95-dfb7-457e-9916-f6b7942d7479/CtLEGpLFCs.json',
  })
  // .addAnimation({
  //     id: 'audio',
  //     // url: 'https://assets10.lottiefiles.com/packages/lf20_tykuirhr.json',
  //     // url: 'https://lottie.host/d9f7a848-50ab-4d42-805f-0e5a5f686ebe/6JE9gErlEZ.json'
  //     url: 'https://lottie.host/a9b21c95-dfb7-457e-9916-f6b7942d7479/CtLEGpLFCs.json'
  // })
  .build()
  .then((value) => {
    return value.toArrayBuffer();
  })
  .then(async (value) => {
    const filename = 'double_audio_animation.lottie';

    console.log('> Writing to file: ', filename);

    fs.writeFileSync(filename, Buffer.from(value));

    const audio = await getAudio(new Uint8Array(value), 'audio_1.mpeg');
    const allAudio = await getAllAudio(new Uint8Array(value));
    console.log('Received audio:');
    console.log(audio);

    // console.log(allAudio)

    // let ad = new DotLottie();

    // ad = await ad.fromArrayBuffer(value);

    // const audio_0 = await ad.getAnimation('audio_0');
    // const audio_1 = await ad.getAnimation('audio_1');

    // fs.writeFileSync("audio_0.json", JSON.stringify(await audio_0.toJSON({
    //     inlineAssets: true
    // })));
    // fs.writeFileSync("audio_1.json", JSON.stringify(await audio_1.toJSON({
    //     inlineAssets: true
    // })));

    const anim_0 = await getAnimation(new Uint8Array(value), 'audio_0', {
      inlineAssets: true,
    });
    const anim_1 = await getAnimation(new Uint8Array(value), 'audio_1', {
      inlineAssets: true,
    });
    fs.writeFileSync('anim_0.json', JSON.stringify(anim_0));
    fs.writeFileSync('anim_1.json', JSON.stringify(anim_1));
  });
