/**
 * Created by m.chekryshov on 03.03.17.
 */
import {hasCyclicReferences, containsString} from '../../lib/utils';

describe('hasCyclicReferences method', ()=> {
  it('should be able find cycle', ()=> {
    const c = {a: 1};
    c.c = c;

    expect(hasCyclicReferences(c)).toEqual(true);
  });

  it('should find return tru for cycles only', ()=> {
    const c = {a: 1};

    expect(hasCyclicReferences(c)).toEqual(false);
  });
});

describe('containsString method', ()=> {
  it('should work', ()=> {
    const sub = '11';
    const c = 'asasassasas'

    expect(containsString(c + sub, sub)).toEqual(true);
    expect(containsString(c, sub)).toEqual(false);
  });
});
