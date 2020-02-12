/********************************************************************************
 *   Ledger Node JS API for ICON
 *   (c) 2016-2017 Ledger
 * 
 *  Modifications (c) 2018 ICON Foundation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ********************************************************************************/
//@flow

type Defer<T> = {
  promise: Promise<T>;
  resolve: (arg0: T) => void;
  reject: (arg0: any) => void;
};

export function defer<T>(): Defer<T> {
  let resolve, reject;
  let promise = new Promise<T>(function (success, failure) {
    resolve = success;
    reject = failure;
  });
  if (!resolve || !reject) throw new Error("defer() error"); // this never happens and is just to make flow happy
  return { promise, resolve, reject };
}

// TODO use bip32-path library
export function splitPath(path: string): number[] {
  let result: any[] = [];
  let components = path.split("/");
  components.forEach(element => {
    let number = parseInt(element, 10);
    if (isNaN(number)) {
      return; // FIXME shouldn't it throws instead?
    }
    if (element.length > 1 && element[element.length - 1] === "'") {
      number += 0x80000000;
    }
    result.push(number);
  });
  return result;
}

// TODO use async await

export function eachSeries<A>(arr: A[], fun: any): any {
  return arr.reduce((p, e) => p.then(() => fun(e)), Promise.resolve());
}

export function foreach<T, A>(
  arr: T[],
  callback: (arg0: T, arg1: number) => Promise<A>
): Promise<A[]> {
  function iterate(index: number, array: any, result: any): any {
    if (index >= array.length) {
      return result;
    } else
      return callback(array[index], index).then(function (res) {
        result.push(res);
        return iterate(index + 1, array, result);
      });
  }
  return Promise.resolve().then(() => iterate(0, arr, []));
}

export function doIf(
  condition: boolean,
  callback: () => any | Promise<any>
): Promise<void> {
  return Promise.resolve().then(() => {
    if (condition) {
      return callback();
    }
  });
}

export function asyncWhile<T>(
  predicate: () => boolean,
  callback: () => Promise<T>
): Promise<Array<T>> {
  function iterate(result: any): any {
    if (!predicate()) {
      return result;
    } else {
      return callback().then(res => {
        result.push(res);
        return iterate(result);
      });
    }
  }
  return Promise.resolve([]).then(iterate);
}

export function hexToBase64(hexString: string) {
  return btoa((hexString.match(/\w{2}/g) || []).map(function (a) {
    return String.fromCharCode(parseInt(a, 16));
  }).join(""));
}
