/**
 * Copyright 2023 Design Barn Inc.
 */

import type { ManifestAnimation } from './manifest';

export type PlaybackOptions = Omit<ManifestAnimation, 'id'>;

export interface StateAnimationSettings extends PlaybackOptions {
  // Scroll takes a visbility threshold between 0 and 1.
  playOnScroll?: [number, number];
  segments?: [number, number] | string;
}

export interface Transitionable {
  state: string;
}

export interface StateTransitionOnClick extends Transitionable {}

export interface StateTransitionOnAfter extends Transitionable {
  ms: number;
}

export interface StateTransitionOnEnter extends Transitionable {
  count: number;
}

export interface StateTransitionOnMouseEnter extends Transitionable {}

export interface StateTransitionOnMouseLeave extends Transitionable {}

export interface StateTransitionOnComplete extends Transitionable {}

export interface StateTransitionOnShow extends Transitionable {
  threshold?: number[];
}

export interface StateInfo {
  id: string;
  initial: string;
}

export const EVENT_MAP = {
  click: 'onClick',
  mouseenter: 'onMouseEnter',
  mouseleave: 'onMouseLeave',
  complete: 'onComplete',
  after: 'onAfter',
  enter: 'onEnter',
  show: 'onShow',
};

export const DotLottieStateEvents = Object.values(EVENT_MAP);

export const XStateEvents = Object.keys(EVENT_MAP);

export type EventMap = typeof EVENT_MAP;

export interface StateTransitionEvents {
  onAfter?: StateTransitionOnAfter;
  onClick?: StateTransitionOnClick;
  onComplete?: StateTransitionOnComplete;
  onEnter?: StateTransitionOnEnter;
  onMouseEnter?: StateTransitionOnMouseEnter;
  onMouseLeave?: StateTransitionOnMouseLeave;
  onShow?: StateTransitionOnShow;
}

export interface StateSettings extends StateTransitionEvents {
  animationId?: string;
  playbackSettings: StateAnimationSettings;
}

export interface DotLottieStates {
  [key: string]: StateSettings;
}

export interface XStateTargetEvent {
  target: string;
}

export interface XState {
  after: Record<number, XStateTargetEvent>;
  entry?: () => void;
  exit?: () => void;
  meta: StateAnimationSettings;
  on: Record<keyof EventMap, XStateTargetEvent>;
}

export interface XStateMachine {
  id: string;
  initial: string;
  states: Record<string, XState>;
}
