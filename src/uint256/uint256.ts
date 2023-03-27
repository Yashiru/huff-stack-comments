import * as m from './arithmetic';

export class UInt256 {
  public buffer?: ArrayBuffer;

  public compareTo = this.cmp;
  public subtract = this.sub;
  public divideAndRemainder = this.divmod;
  public divide = this.div;
  public divideSigned = this.sdiv;
  public multiply = this.mul;
  public remainder = this.mod;
  public shiftRight = this.shr;
  public shiftLeft = this.shl;

  private isMutable: boolean = false;

  constructor(numberOrBufferCopy?: number | UInt256 | ArrayBuffer);
  constructor(str?: string, radix?: number);
  constructor(
    param?: string | number | UInt256 | ArrayBuffer,
    radix: number = 10
  ) {
    if (!param) {
      return this;
    }
    if (param instanceof ArrayBuffer) {
      if (param.byteLength === m.BYTES) {
        this.buffer = param;
      } else {
        throw new TypeError('NAN');
      }
      return this.optimize();
    }
    if (param instanceof UInt256) {
      if (param.buffer) {
        this.buffer = param.buffer.slice(0);
      }
      return this;
    }
    if (typeof param === 'number') {
      if (param < 0 || param > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      if (param !== 0) {
        this.buffer = m.numberToBuffer(param);
      }
      return this;
    }
    const prefixed = 'xX'.indexOf(param[1]) !== -1;
    if (radix === 16 || prefixed) {
      this.buffer = new ArrayBuffer(m.BYTES);
      if (m.fromHex(this.buffer, param, prefixed)) {
        throw new TypeError('NAN');
      }
      return this.optimize();
    }
    if (radix > m.RADIX_MAX || radix < m.RADIX_MIN) {
      throw new TypeError('NAN');
    }
    for (let i = 0; i < param.length; i += 1) {
      const chr = parseInt(param.charAt(i), radix);
      if (isNaN(chr)) {
        throw new TypeError('NAN');
      }
      this.mul(radix, true).add(chr, true);
    }
    return this;
  }

  public static valueOf(val: number): UInt256 {
    return new UInt256(val);
  }

  public mutable(mutable: boolean = true): UInt256 {
    this.isMutable = mutable;
    return this;
  }

  public pow(rval: number, mutate?: boolean): UInt256 {
    if (rval < 0) {
      throw new Error('NAN');
    }
    const lval = (mutate && this) || this.copy();
    if (rval === 0) {
      lval.buffer = new UInt256(1).buffer;
      return lval;
    }
    if (!lval.buffer) {
      return lval;
    }
    const rv = (mutate && this.copy()) || this;
    // tslint:disable-next-line:no-increment-decrement
    while (--rval) {
      m.mul(lval.buffer, <ArrayBuffer>rv.buffer);
    }
    return lval.optimize();
  }

  public add(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      if (rval !== 0) {
        if (!lval.buffer) {
          lval.buffer = m.numberToBuffer(rval);
          return lval;
        }
        m.add(lval.buffer, rval);
        lval.optimize();
      }
      return lval;
    }
    if (!rval.buffer) {
      return lval;
    }
    if (!lval.buffer) {
      lval.buffer = rval.buffer.slice(0);
      return lval;
    }
    m.add(lval.buffer, rval.buffer);
    return lval.optimize();
  }

  public safeAdd(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const res = this.add(rval);
    if (this.gt(res)) {
      throw new TypeError('OF');
    }
    if (mutate) {
      this.buffer = res.buffer;
      return this;
    }
    return res;
  }

  public gcd(rval: UInt256, mutate: boolean = this.isMutable): UInt256 {
    let t = this.mod(rval);
    let num = rval.copy();
    let denom = t;
    while (denom.neq(0)) {
      t = num.mod(denom, true);
      num = denom;
      denom = t;
    }
    if (!mutate) {
      return num;
    }
    this.buffer = num.buffer;
    return this;
  }

  public sub(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      if (rval !== 0) {
        if (!lval.buffer) {
          lval.buffer = m.numberToBuffer(rval);
          m.comp(lval.buffer);
          return lval;
        }
        m.sub(lval.buffer, rval);
        lval.optimize();
      }
      return lval;
    }
    if (!rval.buffer) {
      return lval;
    }
    if (!lval.buffer) {
      lval.buffer = rval.buffer.slice(0);
      m.comp(lval.buffer);
      return lval;
    }
    m.sub(lval.buffer, rval.buffer);
    return lval.optimize();
  }

  public safeSub(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    if (this.lt(rval)) {
      throw new TypeError('OF');
    }
    return this.sub(rval, mutate);
  }

  public divmod(rval: UInt256 | number): UInt256[] {
    const lval = this.copy();
    rval = new UInt256(rval);
    if (!lval.buffer) {
      return [lval, lval.copy()];
    }
    if (m.divmod(lval.buffer, rval.buffer)) {
      throw new TypeError('DBZ');
    }
    return [rval.optimize(), lval.optimize()];
  }

  public div(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (!lval.buffer) {
      return lval;
    }
    rval = new UInt256(rval);
    if (rval.eq(0)) {
    }
    if (m.divmod(lval.buffer, rval.buffer)) {
      rval = new UInt256(0); // dividing by zero returns 0 in the EVM
    }
    lval.buffer = rval.buffer;
    return lval.optimize();
  }

  public sdiv(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    let lval = (mutate && this) || this.copy();
    rval = new UInt256(rval);

    const maxInt256 = new UInt256(m.MAX_INT256, 16);
    const negateResult = 
      rval.gt(maxInt256) && !lval.gt(maxInt256) || 
      lval.gt(maxInt256) && !rval.gt(maxInt256);

    lval = lval.gt(maxInt256) ? lval.negate() : lval;
    rval = rval.gt(maxInt256) ? rval.negate() : rval;

    lval = lval.div(rval)

    if(negateResult) lval = lval = lval.negate();

    return lval.optimize();
  }

  public mod(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    let lval = (mutate && this) || this.copy();
    if (!lval.buffer) {
      return lval;
    }
    rval = new UInt256(rval);
    if (m.divmod(lval.buffer, rval.buffer)) {
      lval = new UInt256(0); // dividing by zero returns 0 in the EVM
    }
    return lval.optimize();
  }

  public smod(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    let lval = (mutate && this) || this.copy();
    rval = new UInt256(rval);

    const maxInt256 = new UInt256(m.MAX_INT256, 16);
    const negateResult = 
      rval.gt(maxInt256) && lval.gt(maxInt256) ||
      lval.gt(maxInt256);

    lval = lval.gt(maxInt256) ? lval.negate() : lval;
    rval = rval.gt(maxInt256) ? rval.negate() : rval;

    lval = lval.mod(rval)

    if(negateResult) lval = lval = lval.negate();

    return lval.optimize();
  }

  public mul(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (!lval.buffer) {
      return lval;
    }
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      if (rval === 0) {
        delete lval.buffer;
        return lval;
      }
      m.mul(lval.buffer, rval);
      return lval.optimize();
    }
    if (!rval.buffer) {
      delete lval.buffer;
      return lval;
    }
    m.mul(lval.buffer, rval.buffer);
    return lval.optimize();
  }

  public safeMul(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    if (this.eq(0)) {
      return (mutate && this) || this.copy();
    }
    const res = this.mul(rval);
    if (res.div(this).neq(rval)) {
      throw new TypeError('OF');
    }
    if (mutate) {
      this.buffer = res.buffer;
      return this;
    }
    return res;
  }

  public and(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (!lval.buffer) {
      return lval;
    }
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      if (rval === 0) {
        delete lval.buffer;
        return lval;
      }
      m.and(lval.buffer, rval);
      return lval;
    }
    if (!rval.buffer) {
      delete lval.buffer;
      return lval;
    }
    m.and(lval.buffer, rval.buffer);
    return lval;
  }

  public andNot(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (!lval.buffer) {
      return lval;
    }
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      if (rval === 0) {
        return lval;
      }
      m.andNot(lval.buffer, rval);
      return lval.optimize();
    }
    if (!rval.buffer) {
      return lval;
    }
    m.andNot(lval.buffer, rval.buffer);
    return lval.optimize();
  }

  public or(rval: UInt256 | number, mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (!lval.buffer) {
      lval.buffer = new UInt256(rval).buffer;
      return lval;
    }
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      if (rval === 0) {
        return lval;
      }
      m.or(lval.buffer, rval);
      return lval;
    }
    if (!rval.buffer) {
      return lval;
    }
    m.or(lval.buffer, rval.buffer);
    return lval;
  }

  public xor(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (!lval.buffer) {
      lval.buffer = new UInt256(rval).buffer;
      return lval;
    }
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      if (rval === 0) {
        return lval;
      }
      m.xor(lval.buffer, rval);
      return lval.optimize();
    }
    if (!rval.buffer) {
      return lval;
    }
    m.xor(lval.buffer, rval.buffer);
    return lval.optimize();
  }

  public not(mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    lval.buffer = lval.buffer || new ArrayBuffer(m.BYTES);
    m.not(lval.buffer);
    return lval.optimize();
  }

  public shl(shift: number, mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (shift < 0 || shift > m.JSNUMBER_MAX_INTEGER) {
      throw new TypeError('NAN');
    }
    if (!lval.buffer) {
      return lval;
    }
    m.shl(lval.buffer, shift);
    return lval.optimize();
  }

  public shr(shift: number, mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (shift < 0 || shift > m.JSNUMBER_MAX_INTEGER) {
      throw new TypeError('NAN');
    }
    if (!lval.buffer) {
      return lval;
    }
    m.shr(lval.buffer, shift);
    return lval.optimize();
  }

  public sar(shift: number, mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (shift < 0 || shift > m.JSNUMBER_MAX_INTEGER) {
      throw new TypeError('NAN');
    }
    if (!lval.buffer) {
      return lval;
    }
    m.sar(lval.buffer, shift);
    return lval.optimize();
  }

  public eq(rval: UInt256 | number): boolean {
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      if (!this.buffer) {
        return rval === 0;
      }
      return m.eq(this.buffer, rval);
    }
    if (!this.buffer) {
      return !rval.buffer || m.eq(rval.buffer, 0);
    }
    return m.eq(this.buffer, rval.buffer || 0);
  }

  public neq(rval: UInt256 | number): boolean {
    return !this.eq(rval);
  }

  public cmp(rval: UInt256 | number): number {
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      if (!this.buffer) {
        return (rval > 0 && -1) || (rval < 0 && 1) || 0;
      }
      return m.cmp(this.buffer, rval);
    }
    if (!this.buffer) {
      if (!rval.buffer) {
        return 0;
      }
      return m.cmp(rval.buffer, 0) * -1;
    }
    return m.cmp(this.buffer, rval.buffer || 0);
  }

  public cmpSigned(rval: UInt256): number {
    if (!this.buffer) {
      if (!rval.buffer) {
        return 0;
      }
      return m.cmpSigned(rval.buffer, 0) * -1;
    }
    return m.cmpSigned(this.buffer, rval.buffer || 0);
  }


  public lte(rval: UInt256 | number): boolean {
    return this.cmp(rval) <= 0;
  }

  public lt(rval: UInt256 | number): boolean {
    return this.cmp(rval) < 0;
  }

  public slt(rval: UInt256): boolean {
    return this.cmpSigned(rval) < 0;
  }

  public gte(rval: UInt256 | number): boolean {
    return this.cmp(rval) >= 0;
  }

  public gt(rval: UInt256 | number): boolean {
    return this.cmp(rval) > 0;
  }

  public sgt(rval: UInt256): boolean {
    return this.cmpSigned(rval) > 0;
  }

  public copy(): UInt256 {
    if (!this.buffer) {
      return new UInt256();
    }
    return new UInt256(this.buffer.slice(0));
  }

  public valueOf(): number {
    if (!this.buffer) {
      return 0;
    }
    return m.toNumber(this.buffer);
  }

  public toString(radix: number = 10): string {
    if (!this.buffer) {
      return '0';
    }
    if (radix === 16) {
      return m.toHex(this.buffer);
    }
    if (radix > m.RADIX_MAX || radix < m.RADIX_MIN) {
      radix = 10;
    }
    if (m.cmp(this.buffer, m.JSNUMBER_MAX_INTEGER) <= 0) {
      return this.valueOf().toString(radix);
    }
    let out: string = '';
    let divmod: UInt256[] = [];
    divmod[0] = this;
    divmod[1] = new UInt256(0);
    do {
      divmod = divmod[0].divmod(radix);
      out = m.ALPHABET.charAt(divmod[1].valueOf() & m.BYTE_MASK) + out;
    } while (divmod[0].buffer);
    return out;
  }

  public toJSON(): string {
    return this.toString();
  }

  public toByteArray(): Uint8Array {
    if (!this.buffer) {
      return new Uint8Array(new ArrayBuffer(m.BYTES));
    }
    return new Uint8Array(this.buffer.slice(0)).reverse();
  }

  public testBit(n: number): boolean {
    if (!this.buffer) {
      return false;
    }
    const buffer = this.buffer.slice(0);
    m.shr(buffer, n);
    m.and(buffer, 1);
    return m.eq(buffer, 1);
  }

  public setBit(n: number, mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    lval.buffer = lval.buffer || new ArrayBuffer(m.BYTES);
    const nbuffer = new ArrayBuffer(m.BYTES);
    m.add(nbuffer, 1);
    m.shl(nbuffer, n);
    m.or(lval.buffer, nbuffer);
    return lval;
  }

  public flipBit(n: number, mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    lval.buffer = lval.buffer || new ArrayBuffer(m.BYTES);
    const nbuffer = new ArrayBuffer(m.BYTES);
    m.add(nbuffer, 1);
    m.shl(nbuffer, n);
    m.xor(lval.buffer, nbuffer);
    return lval.optimize();
  }

  public clearBit(n: number, mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (!lval.buffer) {
      return lval;
    }
    const nbuffer = new ArrayBuffer(m.BYTES);
    m.add(nbuffer, 1);
    m.shl(nbuffer, n);
    m.not(nbuffer);
    m.and(lval.buffer, nbuffer);
    return lval.optimize();
  }

  public bitCount(): number {
    if (!this.buffer) {
      return 0;
    }
    return m.pop(this.buffer);
  }

  public negate(mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    lval.buffer = lval.buffer || new ArrayBuffer(m.BYTES);
    m.comp(lval.buffer);
    return lval.optimize();
  }

  public min(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    rval = new UInt256(rval);
    if (rval.lt(lval)) {
      lval.buffer = rval.buffer;
    }
    return lval;
  }

  public max(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    rval = new UInt256(rval);
    if (rval.gt(lval)) {
      lval.buffer = rval.buffer;
    }
    return lval;
  }

  private optimize(): UInt256 {
    if (!this.buffer) {
      return this;
    }
    if (m.eq(this.buffer, 0)) {
      delete this.buffer;
    }
    return this;
  }
}

/* tslint:disable:function-name */
export function U256(num: number | ArrayBuffer): UInt256;
export function U256(str: string, radix?: number): UInt256;
export function U256(param: string | number | ArrayBuffer, param2?: number): UInt256 {
  if (typeof param === 'string') {
    return new UInt256(param, param2);
  }
  return new UInt256(param);
}
/* tslint:enable:function-name */
