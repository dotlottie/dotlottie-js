/**
 * Copyright 2023 Design Barn Inc.
 */

import type { ZipOptions } from 'fflate';
import { safeParse } from 'valibot';

import { DotLottieError } from '../../utils';

import type { ManifestTheme, ThemeData } from './schemas';
import { ThemeDataSchema } from './schemas';

export interface ThemeOptions extends ManifestTheme {
  data: ThemeData;
  id: string;
  zipOptions?: ZipOptions;
}

export class LottieThemeCommon {
  protected _data: ThemeData;

  protected _id: string;

  protected _name: string | undefined;

  protected _zipOptions: ZipOptions;

  public constructor(options: ThemeOptions) {
    this._requireValidId(options.id);
    this._requireValidData(options.data);

    this._name = options.name;
    this._data = options.data;
    this._id = options.id;

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

  public get data(): ThemeData {
    return this._data;
  }

  public set data(data: ThemeData) {
    this._requireValidData(data);

    this._data = data;
  }

  public async toString(): Promise<string> {
    return JSON.stringify(this._data);
  }

  private _requireValidId(id: string | undefined): asserts id is string {
    if (typeof id !== 'string' || !id) throw new DotLottieError('Invalid theme id');
  }

  private _requireValidData(data: ThemeData): asserts data is ThemeData {
    const result = safeParse(ThemeDataSchema, data);

    if (!result.success) {
      const issues = JSON.stringify(result.issues, null, 2);

      throw new DotLottieError(`Invalid theme data: ${issues}`);
    }
  }
}
