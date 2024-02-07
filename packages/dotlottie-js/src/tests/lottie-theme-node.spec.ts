/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable @lottiefiles/import-filename-format */
/* eslint-disable no-new */

import type { Animation as AnimationType } from '@lottiefiles/lottie-types';

import { LottieTheme, LottieAnimation } from '..';

import animationData from './__fixtures__/simple/animation/animations/lottie1.json';
import themeData from './__fixtures__/simple/animation/themes/theme1.json';

describe('LottieTheme', () => {
  it('throws an error if it receives an invalid id when constructed', () => {
    expect(() => {
      // act
      new LottieTheme({ id: '' });
      // assert
    }).toThrowError('[dotlottie-js]: Invalid theme id');
  });

  it('throws an error if it receives an invalid url when constructed', () => {
    // arrange
    const invalidUrl = 'xyz';

    expect(() => {
      // act
      new LottieTheme({ id: 'test', url: invalidUrl });

      // assert
    }).toThrowError('[dotlottie-js]: Invalid theme url');
  });

  it('throws an error if it receives an invalid theme data when constructed', () => {
    // arrange
    const invalidData = 'invalid' as unknown as Record<string, unknown>;

    expect(() => {
      // act
      new LottieTheme({ id: 'test', data: invalidData });

      // assert
    }).toThrowError('[dotlottie-js]: Invalid theme data');
  });

  it('gets and sets the zipOptions', () => {
    const theme = new LottieTheme({
      id: 'test',
      data: themeData,
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
    const animation = new LottieTheme({ id: 'test', data: themeData });

    expect(animation.id).toEqual('test');

    // act
    animation.id = 'test2';

    // assert
    expect(animation.id).toEqual('test2');
  });

  it('gets and sets the data', () => {
    // arrange
    const animation = new LottieTheme({ id: 'test', url: 'https://example.com' });

    expect(animation.data).toBeUndefined();

    // act
    animation.data = themeData;

    // assert
    expect(animation.data).toEqual(themeData);
  });

  it('gets and sets the url', () => {
    // arrange
    const animation = new LottieTheme({ id: 'test', data: themeData });

    expect(animation.url).toBeUndefined();

    // act
    animation.url = 'https://example.com';

    // assert
    expect(animation.url).toEqual('https://example.com');
  });

  it('adds an animation', () => {
    // arrange
    const theme = new LottieTheme({ id: 'theme1', data: themeData });

    const animation = new LottieAnimation({
      id: 'animation1',
      data: animationData as unknown as AnimationType,
    });

    expect(theme.animations.length).toEqual(0);

    // act
    theme.addAnimation(animation);

    // assert
    expect(theme.animations.length).toEqual(1);

    expect(theme.animations[0]).toEqual(animation);
  });

  it('removes an animation', () => {
    // arrange
    const theme = new LottieTheme({ id: 'theme1', data: themeData });

    const animation = new LottieAnimation({
      id: 'animation1',
      data: animationData as unknown as AnimationType,
    });

    expect(theme.animations.length).toEqual(0);

    theme.addAnimation(animation);

    expect(theme.animations.length).toEqual(1);

    expect(theme.animations[0]).toEqual(animation);

    // act
    theme.removeAnimation(animation.id);

    // assert
    expect(theme.animations.length).toEqual(0);
  });

  it('gets animations', () => {
    // arrange
    const theme = new LottieTheme({ id: 'theme1', data: themeData });

    const animation1 = new LottieAnimation({
      id: 'animation1',
      data: animationData as unknown as AnimationType,
    });

    const animation2 = new LottieAnimation({
      id: 'animation2',
      data: animationData as unknown as AnimationType,
    });

    // act
    theme.addAnimation(animation1);
    theme.addAnimation(animation2);

    // assert
    expect(theme.animations.length).toEqual(2);

    expect(theme.animations[0]).toEqual(animation1);
    expect(theme.animations[1]).toEqual(animation2);
  });

  it('resolves theme data from a url', async () => {
    // arrange
    const fetchSpy = spyOn(typeof window === 'undefined' ? global : window, 'fetch').and.returnValue(
      Promise.resolve(new Response(JSON.stringify(themeData))),
    );

    const theme = new LottieTheme({ id: 'theme1', url: 'https://example.com' });

    expect(theme.data).toBeUndefined();

    // act
    const content = await theme.toString();

    // assert
    expect(content).toEqual(JSON.stringify(themeData));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith('https://example.com');

    expect(theme.data).toEqual(themeData);
  });
});
