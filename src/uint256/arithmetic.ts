export const ALPHABET = '0123456789abcdef';

export const BYTES = 32;
export const BYTE_MASK = 0xff;

export const WORDS = BYTES / 2;
export const WORD_LENGTH = 16;
export const WORD_MASK = 0xffff;

export const DWORDS = BYTES / 4;
export const DWORD_LENGTH = 32;
export const DWORD_MASK = 0xffffffff;

export const JSNUMBER_MAX_INTEGER = 9007199254740991;

export const RADIX_MIN = 2;
export const RADIX_MAX = 16;

export const MAX_INT256 = "0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";

export function fromHex(
  buffer: ArrayBuffer,
  str: string,
  prefixed: boolean
): number {
  if (str.length < ((prefixed && 3) || 1)) {
    return 1;
  }
  const min = (prefixed && 2) || 0;
  const pd = new Uint8Array(buffer);
  let i = 0;
  let p = str.length - 1;
  while (p >= min && i < BYTES) {
    // tslint:disable-next-line:no-increment-decrement
    let val = parseInt(str.substr(p--, 1), 16);
    if (isNaN(val)) {
      return 1;
    }
    pd[i] = val;
    if (p >= min) {
      // tslint:disable-next-line:no-increment-decrement
      val = parseInt(str.substr(p--, 1), 16);
      if (isNaN(val)) {
        return 1;
      }
      pd[i] |= val << 4;
      i += 1;
    }
  }
  return 0;
}

export function toHex(buffer: ArrayBuffer): string {
  const ret = [];
  let hasVal = false;
  const pd = new Uint8Array(buffer);
  for (let i = pd.length; i; i -= 1) {
    if (!hasVal && !pd[i - 1]) {
      continue;
    }
    ret.push(ALPHABET[pd[i - 1] >>> 4]);
    ret.push(ALPHABET[pd[i - 1] & 0x0f]);
    hasVal = true;
  }
  while (ret.length && ret[0] === '0') {
    ret.shift();
  }
  return ret.join('') || '0';
}

export function toNumber(buffer: ArrayBuffer): number {
  let ret = 0;
  const pd = new Uint32Array(buffer);
  for (let i = 0; i < pd.length; i += 1) {
    if (pd[i]) {
      ret += pd[i] * 0x100000000 ** i;
    }
  }
  return ret;
}

export function numberToBuffer(num: number): ArrayBuffer {
  const buffer = new ArrayBuffer(BYTES);
  const buffer32 = new Uint32Array(buffer);
  buffer32[0] = num;
  buffer32[1] = num / (DWORD_MASK + 1);
  return buffer;
}

export function add(lval: ArrayBuffer, rval: ArrayBuffer | number): void {
  if (typeof rval === 'number') {
    rval = numberToBuffer(rval);
  }
  const mem = new Uint32Array(2);
  const lv = new Uint16Array(lval);
  const rv = new Uint16Array(rval);
  for (let i = 0; i < WORDS; i += 1) {
    mem[0] = mem[1] + lv[i] + rv[i];
    lv[i] = mem[0] & WORD_MASK;
    mem[1] = mem[0] >>> WORD_LENGTH;
  }
}

export function not(lval: ArrayBuffer): void {
  const lv = new Uint32Array(lval);
  for (let i = 0; i < lv.length; i += 1) {
    lv[i] = ~lv[i];
  }
}

export function and(lval: ArrayBuffer, rval: ArrayBuffer | number): void {
  if (typeof rval === 'number') {
    rval = numberToBuffer(rval);
  }
  const lv = new Uint32Array(lval);
  const rv = new Uint32Array(rval);
  for (let i = 0; i < lv.length; i += 1) {
    lv[i] &= rv[i];
  }
}

export function andNot(lval: ArrayBuffer, rval: ArrayBuffer | number): void {
  if (typeof rval === 'number') {
    rval = numberToBuffer(rval);
  }
  const lv = new Uint32Array(lval);
  const rv = new Uint32Array(rval);
  for (let i = 0; i < lv.length; i += 1) {
    lv[i] &= ~rv[i];
  }
}

export function or(lval: ArrayBuffer, rval: ArrayBuffer | number): void {
  if (typeof rval === 'number') {
    rval = numberToBuffer(rval);
  }
  const lv = new Uint32Array(lval);
  const rv = new Uint32Array(rval);
  for (let i = 0; i < lv.length; i += 1) {
    lv[i] |= rv[i];
  }
}

export function xor(lval: ArrayBuffer, rval: ArrayBuffer | number): void {
  if (typeof rval === 'number') {
    rval = numberToBuffer(rval);
  }
  const lv = new Uint32Array(lval);
  const rv = new Uint32Array(rval);
  for (let i = 0; i < lv.length; i += 1) {
    lv[i] ^= rv[i];
  }
}

export function comp(lval: ArrayBuffer): void {
  not(lval);
  add(lval, 1);
}

export function sub(lval: ArrayBuffer, rval: ArrayBuffer | number): void {
  if (typeof rval === 'number') {
    rval = numberToBuffer(rval);
  } else {
    rval = rval.slice(0);
  }
  comp(rval);
  add(lval, rval);
}

export function eq(lval: ArrayBuffer, rval: ArrayBuffer | number): boolean {
  const lv = new Uint32Array(lval);
  if (typeof rval === 'number') {
    for (let i = DWORDS - 1; i >= 2; i -= 1) {
      if (lv[i]) {
        return false;
      }
    }
    if (lv[1] !== ~~(rval / (DWORD_MASK + 1))) {
      return false;
    }
    const mem = new Uint32Array(1);
    mem[0] = rval & DWORD_MASK;
    if (lv[0] !== mem[0]) {
      return false;
    }
    return true;
  }
  const rv = new Uint32Array(rval);
  for (let i = 0; i < lv.length; i += 1) {
    if (lv[i] !== rv[i]) {
      return false;
    }
  }
  return true;
}

export function cmp(lval: ArrayBuffer, rval: ArrayBuffer | number): number {
  if (typeof rval === 'number') {
    rval = numberToBuffer(rval);
  }
  const lv = new Uint32Array(lval);
  const rv = new Uint32Array(rval);
  for (let i = DWORDS - 1; i >= 0; i -= 1) {
    if (lv[i] < rv[i]) {
      return -1;
    }
    if (lv[i] > rv[i]) {
      return 1;
    }
  }
  return 0;
}

export function cmpSigned(lval: ArrayBuffer, rval: ArrayBuffer | number): number {
  if (typeof rval === 'number') {
    rval = numberToBuffer(rval);
  }
  const lv = new Uint8Array(lval);
  const rv = new Uint8Array(rval);

  let order = 0;
  for (let i = BYTES - 2; i >= 0; i -= 1) {
    if (lv[i] < rv[i]) {
      order = -1;
      break;
    }
    if (lv[i] > rv[i]) {
      order = 1;
      break;
    }
  }

  const MAX = BYTES - 1;
  const lbit = lv[MAX] >> 7;
  const rbit = rv[MAX] >> 7;
  if (rbit) {
    order = -order;
  }
  const mul = (rbit ? -1 : 1);
  if (lbit !== rbit) {
    return mul * -!!order;
  }
  return order * mul;
}

export function shl(lval: ArrayBuffer, shift: number): void {
  const copy = new Uint32Array(lval.slice(0));
  const lv = new Uint32Array(lval);
  lv.fill(0);
  const mem = new Uint32Array(2);
  mem[0] = shift % DWORD_LENGTH; // shift
  mem[1] = shift / DWORD_LENGTH; // offset
  for (let i = 0; i < DWORDS; i += 1) {
    if (i + mem[1] + 1 < DWORDS && mem[0] !== -0) {
      lv[i + mem[1] + 1] |= copy[i] >>> (DWORD_LENGTH - mem[0]);
    }
    if (i + mem[1] < DWORDS) {
      lv[i + mem[1]] |= copy[i] << mem[0];
    }
  }
}

export function shr(lval: ArrayBuffer, shift: number): void {
  const copy = new Uint32Array(lval.slice(0));
  const lv = new Uint32Array(lval);
  lv.fill(0);
  const mem = new Uint32Array(2);
  mem[0] = shift % DWORD_LENGTH; // shift
  mem[1] = shift / DWORD_LENGTH; // offset
  for (let i = 0; i < DWORDS; i += 1) {
    if (i - mem[1] - 1 >= 0 && mem[0] !== 0) {
      lv[i - mem[1] - 1] |= copy[i] << (DWORD_LENGTH - mem[0]);
    }
    if (i - mem[1] >= 0) {
      lv[i - mem[1]] |= copy[i] >>> mem[0];
    }
  }
}

export function sar(lval: ArrayBuffer, shift: number): void {
  const copy = new Uint32Array(lval.slice(0));
  const lv = new Uint32Array(lval);
  lv.fill(0);
  const mem = new Uint32Array(2);
  mem[0] = shift % DWORD_LENGTH; // shift
  mem[1] = shift / DWORD_LENGTH; // offset
  for (let i = 0; i < DWORDS; i += 1) {
    if (i - mem[1] - 1 >= 0 && mem[0] !== 0) {
      lv[i - mem[1] - 1] |= copy[i] << (DWORD_LENGTH - mem[0]);
    }
    if (i - mem[1] >= 0) {
      lv[i - mem[1]] |= copy[i] >> mem[0];
    }
  }
}

export function mul(lval: ArrayBuffer, rval: ArrayBuffer | number): void {
  if (typeof rval === 'number') {
    rval = numberToBuffer(rval);
  }
  const lv = new Uint16Array(lval);
  const rv = new Uint16Array(rval);
  const ret = new Uint16Array(new ArrayBuffer(BYTES));
  const mem = new Uint32Array(3);
  for (let j = 0; j < WORDS; j += 1) {
    mem[0] = 0;
    for (let i = 0; i + j < WORDS; i += 1) {
      mem[2] = lv[j] * rv[i];
      mem[1] = mem[0] + ret[i + j] + mem[2];
      ret[i + j] = mem[1] & WORD_MASK;
      mem[0] = mem[1] >>> WORD_LENGTH;
    }
  }
  lv.set(ret);
}

export function bits(lval: ArrayBuffer): number {
  const lv = new Uint32Array(lval);
  for (let pos = DWORDS - 1; pos >= 0; pos -= 1) {
    if (lv[pos]) {
      for (let nbits = DWORD_LENGTH - 1; nbits > 0; nbits -= 1) {
        if (lv[pos] & (1 << nbits)) {
          return DWORD_LENGTH * pos + nbits + 1;
        }
      }
      return DWORD_LENGTH * pos + 1;
    }
  }
  return 0;
}

// lval = mod, rval = div
export function divmod(lval: ArrayBuffer, rval?: ArrayBuffer): number {
  if (!rval) {
    return 1;
  }
  const num = new Uint32Array(lval.slice(0));
  const lv = new Uint32Array(lval);
  const rv = new Uint32Array(rval);
  lv.fill(0);
  const lvBits = bits(num.buffer);
  const rvBits = bits(rv.buffer);
  if (rvBits === 0) {
    return 1;
  }
  if (rvBits > lvBits) {
    lv.set(num);
    rv.fill(0);
    return 0;
  }
  let shift = lvBits - rvBits;
  shl(rv.buffer, shift);
  while (shift >= 0) {
    if (cmp(num.buffer, rv.buffer) >= 0) {
      sub(num.buffer, rv.buffer);
      lv[~~(shift / DWORD_LENGTH)] |= 1 << (shift - DWORD_LENGTH);
    }
    shr(rv.buffer, 1);
    shift -= 1;
  }
  rv.set(lv);
  lv.set(num);
  return 0;
}

export function pop(lval: ArrayBuffer): number {
  function pop32(x: number): number {
    x = x - ((x >>> 1) & 0x55555555);
    x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
    x = (x + (x >>> 4)) & 0x0f0f0f0f;
    x = x + (x >>> 8);
    x = x + (x >>> 16);
    return x & 0x0000003f;
  }
  const lv = new Uint32Array(lval);
  let sum = 0;
  for (let i = 0; i < DWORDS; i += 1) {
    sum += pop32(lv[i]);
  }
  return sum;
}