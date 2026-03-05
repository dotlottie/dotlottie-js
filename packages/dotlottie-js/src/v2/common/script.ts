/**
 * Copyright 2026 Design Barn Inc.
 */

import type { ZipOptions } from 'fflate';

import { DotLottieError } from '../../utils';

import type { EnvVariable, ManifestScript } from './schemas';

export interface ScriptOptions extends ManifestScript {
  data: string;
  id: string;
  zipOptions?: ZipOptions;
}

export class DotLottieScriptCommon {
  protected _data: string;

  protected _id: string;

  protected _name: string | undefined;

  protected _env: Record<string, EnvVariable> | undefined;

  protected _zipOptions: ZipOptions;

  public constructor(options: ScriptOptions) {
    this._requireValidId(options.id);
    this._requireValidData(options.data);

    this._name = options.name;
    this._data = options.data;
    this._id = options.id;
    this._env = options.env;

    this._zipOptions = options.zipOptions ?? {};
  }

  public get zipOptions(): ZipOptions {
    return this._zipOptions;
  }

  public set zipOptions(zipOptions: ZipOptions) {
    this._zipOptions = zipOptions;
  }

  public get id(): string {
    return this._id;
  }

  public set id(id: string) {
    this._requireValidId(id);

    this._id = id;
  }

  public get name(): string | undefined {
    return this._name;
  }

  public set name(name: string | undefined) {
    this._name = name;
  }

  public get env(): Record<string, EnvVariable> | undefined {
    return this._env;
  }

  public set env(env: Record<string, EnvVariable> | undefined) {
    this._env = env;
  }

  public get data(): string {
    return this._data;
  }

  public set data(data: string) {
    this._requireValidData(data);

    this._data = data;
  }

  public toString(): string {
    return this._data;
  }

  private _requireValidId(id: string | undefined): asserts id is string {
    if (typeof id !== 'string' || !id) throw new DotLottieError('Invalid script id');
  }

  private _requireValidData(data: unknown): asserts data is string {
    if (typeof data !== 'string') throw new DotLottieError('Invalid script data');
  }
}
