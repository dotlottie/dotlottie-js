/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable no-new */

import { describe, it, expect } from 'vitest';

import animationData from '../../../__tests__/__fixtures__/simple/animation/animations/pigeon.json';
import smileyAnimationData from '../../../__tests__/__fixtures__/simple/animation/animations/smiley.json';
import wifiAnimationData from '../../../__tests__/__fixtures__/simple/animation/animations/wifi.json';
import { SmileyWifi, PigeonState } from '../../../__tests__/__fixtures__/simple/state/pigeon-state';
import type { AnimationData } from '../../../types';
import { DotLottie, LottieStateMachine } from '../../index.node';

describe('LottieStateMachine', () => {
  it('throws an error if it receives an invalid id when constructed', () => {
    expect(() => {
      // act
      new LottieStateMachine({
        id: '',
        data: PigeonState.data,
      });
      // assert
    }).toThrowError('Invalid id.');
  });

  it('gets and sets the zipOptions', () => {
    const theme = new LottieStateMachine({
      ...PigeonState,
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
    const state = new LottieStateMachine({
      id: 'test',
      data: {
        initial: 'test',
        states: [
          {
            name: 'test',
            type: 'PlaybackState',
            animation: '',
            mode: 'Forward',
            autoplay: true,
          },
        ],
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
    const pigeonState = new LottieStateMachine(PigeonState);

    // assert
    expect(pigeonState.id).toEqual(PigeonState.id);

    expect(pigeonState.initial).toEqual(PigeonState.data.initial);

    expect(pigeonState.states).toEqual(PigeonState.data.states);

    const dotlottie = new DotLottie();

    dotlottie
      .addAnimation({
        id: 'pigeon',
        data: animationData as unknown as AnimationData,
      })
      .addStateMachine(PigeonState)
      .addAnimation({
        id: 'wifi',
        data: wifiAnimationData as unknown as AnimationData,
      })
      .addAnimation({
        id: 'smiley',
        data: smileyAnimationData as unknown as AnimationData,
      })
      .addStateMachine(SmileyWifi);

    await dotlottie.build();

    expect(dotlottie.stateMachines.length).toEqual(2);

    expect(dotlottie.stateMachines[0]?.id).toEqual(PigeonState.id);

    expect(dotlottie.stateMachines[1]?.id).toEqual(SmileyWifi.id);

    expect(dotlottie.stateMachines[0]?.id).toEqual(PigeonState.id);
    expect(dotlottie.stateMachines[0]?.initial).toEqual(PigeonState.data.initial);
    expect(dotlottie.stateMachines[0]?.states).toEqual(PigeonState.data.states);

    expect(dotlottie.stateMachines[1]?.id).toEqual(SmileyWifi.id);
    expect(dotlottie.stateMachines[1]?.initial).toEqual(SmileyWifi.data.initial);
    expect(dotlottie.stateMachines[1]?.states).toEqual(SmileyWifi.data.states);

    // Remove a state and check
    dotlottie.removeStateMachine(PigeonState.id);

    expect(dotlottie.stateMachines.length).toEqual(1);

    expect(dotlottie.stateMachines[0]?.id).toEqual(SmileyWifi.id);

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
      .addStateMachine(PigeonState)
      .addAnimation({
        id: 'wifi',
        data: wifiAnimationData as unknown as AnimationData,
      })
      .addAnimation({
        id: 'smiley',
        data: smileyAnimationData as unknown as AnimationData,
      })
      .addStateMachine(SmileyWifi);

    await dotlottie.build();

    expect(dotlottie.manifest.stateMachines?.length).toEqual(2);

    const values = [{ id: PigeonState.id }, { id: SmileyWifi.id }];

    if (dotlottie.manifest.stateMachines) {
      dotlottie.manifest.stateMachines.forEach((value, index) => {
        const val = values.at(index);

        if (val) return expect(value).toEqual(val);

        return false;
      });
    }
  });
});
