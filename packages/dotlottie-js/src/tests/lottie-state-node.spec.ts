/**
 * Copyright 2023 Design Barn Inc.
 */

import type { AnimationData } from '../common';
import { DotLottie } from '../dotlottie';
import { LottieState } from '../lottie-state';

import animationData from './__fixtures__/simple/animation/animations/pigeon.json';
import smileyAnimationData from './__fixtures__/simple/animation/animations/smiley.json';
import wifiAnimationData from './__fixtures__/simple/animation/animations/wifi.json';
import { SmileyWifi, PigeonState } from './__fixtures__/simple/state/pigeon-state';

describe('LottieState', () => {
  it('throws an error if it receives an invalid id when constructed', () => {
    expect(() => {
      // act
      // eslint-disable-next-line no-new
      new LottieState({ id: '' });
      // assert
    }).toThrowError('[dotlottie-js]: Invalid id.');
  });

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
    const state = new LottieState({ id: 'test' });

    expect(state.id).toEqual('test');

    // act
    state.id = 'test2';

    // assert
    expect(state.id).toEqual('test2');
  });

  it('gets and sets the data', async () => {
    // arrange
    const state = new LottieState({ id: PigeonState.descriptor.id, state: PigeonState });

    // assert
    expect(state.id).toEqual(PigeonState.descriptor.id);

    expect(state.state?.descriptor.initial).toEqual(PigeonState.descriptor.initial);

    expect(state.state?.states).toEqual(PigeonState.states);

    const dotlottie = new DotLottie();

    dotlottie
      .addAnimation({
        id: 'pigeon',
        data: animationData as unknown as AnimationData,
      })
      .addState({
        id: PigeonState.descriptor.id,
        state: PigeonState,
      })
      .addAnimation({
        id: 'wifi',
        data: wifiAnimationData as unknown as AnimationData,
      })
      .addAnimation({
        id: 'smiley',
        data: smileyAnimationData as unknown as AnimationData,
      })
      .addState({
        id: SmileyWifi.descriptor.id,
        state: SmileyWifi,
      });

    await dotlottie.build();

    expect(dotlottie.states.length).toEqual(2);

    expect(dotlottie.states[0]?.id).toEqual(PigeonState.descriptor.id);

    expect(dotlottie.states[1]?.id).toEqual(SmileyWifi.descriptor.id);

    expect(dotlottie.states[0]?.state).toEqual(PigeonState);

    expect(dotlottie.states[1]?.state).toEqual(SmileyWifi);

    // Remove a state and check
    dotlottie.removeState(PigeonState.descriptor.id);

    expect(dotlottie.states.length).toEqual(1);

    expect(dotlottie.states[0]?.id).toEqual(SmileyWifi.descriptor.id);

    // dotlottie.download('test_02_with_states.lottie');
  });

  it('correctly writes the state names to the manifest', async () => {
    // arrange
    const dotlottie = new DotLottie();

    dotlottie
      .addAnimation({
        id: 'pigeon',
        data: animationData as unknown as AnimationData,
      })
      .addState({
        id: PigeonState.descriptor.id,
        state: PigeonState,
      })
      .addAnimation({
        id: 'wifi',
        data: wifiAnimationData as unknown as AnimationData,
      })
      .addAnimation({
        id: 'smiley',
        data: smileyAnimationData as unknown as AnimationData,
      })
      .addState({
        id: SmileyWifi.descriptor.id,
        state: SmileyWifi,
      });

    await dotlottie.build();

    expect(dotlottie.manifest.states?.length).toEqual(2);

    const values = [PigeonState.descriptor.id, SmileyWifi.descriptor.id];

    if (dotlottie.manifest.states) {
      dotlottie.manifest.states.forEach((value, index) => {
        const val = values.at(index);

        if (val) return expect(value).toEqual(val);

        return false;
      });
    }
  });
});
