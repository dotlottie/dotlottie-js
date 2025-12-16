/**
 * Copyright 2025 Design Barn Inc.
 */

import type { ZipOptions } from 'fflate';
import { safeParse } from 'valibot';

import { DotLottieError } from '../../utils';

import type { DotLottieGlobalInput, DotLottieGlobalInputs } from './schemas';
import { DotLottieGlobalInputsSchema } from './schemas';

export interface GlobalInputsOptions {
  data: DotLottieGlobalInputs;
  id: string;
  name?: string | undefined;
  zipOptions?: ZipOptions | undefined;
}

export class LottieGlobalInputsCommon {
  protected _id: string;

  protected _name: string | undefined;

  protected _data: DotLottieGlobalInputs;

  protected _zipOptions: ZipOptions;

  public constructor(options: GlobalInputsOptions) {
    this._requireValidId(options.id);
    this._requireValidData(options.data);

    this._id = options.id;
    this._name = options.name;
    this._data = options.data;
    this._zipOptions = options.zipOptions ?? {};
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

  public get data(): DotLottieGlobalInputs {
    return this._data;
  }

  public set data(data: DotLottieGlobalInputs) {
    this._requireValidData(data);
    this._data = data;
  }

  public getGlobalInput(id: string): DotLottieGlobalInput | undefined {
    return this.data[id];
  }

  public get zipOptions(): ZipOptions {
    return this._zipOptions;
  }

  public set zipOptions(zipOptions: ZipOptions) {
    this._zipOptions = zipOptions;
  }

  public toString(): string {
    return JSON.stringify(this.data);
  }

  private _requireValidId(id: string | undefined): asserts id is string {
    if (typeof id !== 'string' || !id) throw new DotLottieError('Invalid bindings id');
  }

  private _requireValidData(data: DotLottieGlobalInputs): asserts data is DotLottieGlobalInputs {
    const result = safeParse(DotLottieGlobalInputsSchema, data);

    if (!result.success) {
      const issues = JSON.stringify(result.issues, null, 2);

      throw new DotLottieError(`Invalid bindings data: ${issues}`);
    }
  }
}
