/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable @lottiefiles/import-filename-format */
/* eslint-disable no-new */

import { DotLottie } from '../dotlottie';
import { LottieState } from '../lottie-state';

// import animationData from './__fixtures__/simple/animation/animations/lottie1.json';
import animationData from './__fixtures__/simple/animation/animations/lottie1.json';
import { BounceWifiState, PigeonState } from './__fixtures__/simple/state/pigeon_state';

describe('LottieState', () => {
  it('throws an error if it receives an invalid id when constructed', () => {
    expect(() => {
      // act
      new LottieState({ id: '' });
      // assert
    }).toThrowError('[dotlottie-js]: Invalid id.');
  });

  // it('throws an error if it receives an invalid lottie data when constructed', () => {
  //   // arrange
  //   const invalidData = {} as string;

  //   expect(() => {
  //     // act
  //     new LottieState({ id: 'test', data: invalidData });

  //     // assert
  //   }).toThrowError('[dotlottie-js]: Invalid theme data');
  // });

  it('gets and sets the zipOptions', () => {
    const theme = new LottieState({
      id: 'test',
      zipOptions: {
        level: 9,
        mem: 1,
      },
    });

    expect(theme.zipOptions).toEqual({
      level: 9,
      mem: 1,
    });

    theme.zipOptions = {
      level: 1,
    };

    expect(theme.zipOptions).toEqual({
      level: 1,
    });
  });

  it('gets and sets the id', () => {
    // arrange
    const animation = new LottieState({ id: 'test' });

    expect(animation.id).toEqual('test');

    // act
    animation.id = 'test2';

    // assert
    expect(animation.id).toEqual('test2');
  });

  fit('gets and sets the data', async () => {
    // arrange
    const state = new LottieState({ id: PigeonState.descriptor.id, state: PigeonState });

    // assert
    expect(state.id).toEqual(PigeonState.descriptor.id);

    expect(state.state?.descriptor.initial).toEqual(PigeonState.descriptor.initial);

    expect(state.state?.states).toEqual(PigeonState.states);

    const dotlottie = new DotLottie();

    dotlottie
      .addAnimation({
        id: 'test_animation',
        data: animationData as unknown as AnimationType,
      })
      .addState({
        id: PigeonState.descriptor.id,
        state: PigeonState,
      })
      .addState({
        id: 'wifi_bounce',
        state: BounceWifiState,
      })
      .download('test_01_with_states.lottie');
  });

  // it('gets and sets the url', () => {
  //   // arrange
  //   const animation = new LottieState({ id: 'test', data: themeData });

  //   expect(animation.url).toBeUndefined();

  //   // act
  //   animation.url = 'https://example.com';

  //   // assert
  //   expect(animation.url).toEqual('https://example.com');
  // });

  // it('adds an animation', () => {
  //   // arrange
  //   const theme = new LottieState({ id: 'theme1', data: themeData });

  //   const animation = new DotLottieCommon({
  //     id: 'animation1',
  //     data: animationData as unknown as AnimationType,
  //   });

  //   expect(theme.animations.length).toEqual(0);

  //   // act
  //   theme.addAnimation(animation);

  //   // assert
  //   expect(theme.animations.length).toEqual(1);

  //   expect(theme.animations[0]).toEqual(animation);
  // });

  // it('removes a state', () => {});

  // it('removes an animation', () => {
  //   // arrange
  //   const theme = new LottieState({ id: 'theme1', data: themeData });

  //   const animation = new LottieAnimation({
  //     id: 'animation1',
  //     data: animationData as unknown as AnimationType,
  //   });

  //   expect(theme.animations.length).toEqual(0);

  //   theme.addAnimation(animation);

  //   expect(theme.animations.length).toEqual(1);

  //   expect(theme.animations[0]).toEqual(animation);

  //   // act
  //   theme.removeAnimation(animation.id);

  //   // assert
  //   expect(theme.animations.length).toEqual(0);
  // });

  // it('gets animations', () => {
  //   // arrange
  //   const theme = new LottieState({ id: 'theme1', data: themeData });

  //   const animation1 = new LottieAnimation({
  //     id: 'animation1',
  //     data: animationData as unknown as AnimationType,
  //   });

  //   const animation2 = new LottieAnimation({
  //     id: 'animation2',
  //     data: animationData as unknown as AnimationType,
  //   });

  //   // act
  //   theme.addAnimation(animation1);
  //   theme.addAnimation(animation2);

  //   // assert
  //   expect(theme.animations.length).toEqual(2);

  //   expect(theme.animations[0]).toEqual(animation1);
  //   expect(theme.animations[1]).toEqual(animation2);
  // });

  // it('resolves theme data from a url', async () => {
  //   // arrange
  //   const fetchSpy = spyOn(typeof window === 'undefined' ? global : window, 'fetch').and.returnValue(
  //     Promise.resolve(new Response(themeData)),
  //   );

  //   const theme = new LottieState({ id: 'theme1', url: 'https://example.com' });

  //   expect(theme.data).toBeUndefined();

  //   // act
  //   const content = await theme.toString();

  //   // assert
  //   expect(content).toEqual(themeData);

  //   expect(fetchSpy).toHaveBeenCalledTimes(1);
  //   expect(fetchSpy).toHaveBeenCalledWith('https://example.com');

  //   expect(theme.data).toEqual(themeData);
  // });
});
