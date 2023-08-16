/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable no-new */

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
      new LottieState({
        state: {
          descriptor: { id: '', initial: '' },
          states: {},
        },
      });
      // assert
    }).toThrowError('[dotlottie-js]: Invalid id.');
  });

  it('gets and sets the zipOptions', () => {
    const theme = new LottieState({
      state: {
        descriptor: { id: 'test', initial: '' },
        states: {},
      },
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
    const state = new LottieState({
      state: {
        descriptor: { id: 'test', initial: '' },
        states: {},
      },
    });

    expect(state.id).toEqual('test');

    // act
    state.id = 'test2';

    // assert
    expect(state.id).toEqual('test2');
  });

  it('gets and sets the data', async () => {
    // arrange
    const pigeonState = new LottieState({ state: PigeonState });

    // assert
    expect(pigeonState.id).toEqual(PigeonState.descriptor.id);

    expect(pigeonState.state.descriptor.initial).toEqual(PigeonState.descriptor.initial);

    expect(pigeonState.state.states).toEqual(PigeonState.states);

    const dotlottie = new DotLottie();

    dotlottie
      .addAnimation({
        id: 'pigeon',
        data: animationData as unknown as AnimationData,
      })
      .addState({
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
