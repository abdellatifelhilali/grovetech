import {test} from 'node:test';
import assert from 'node:assert/strict';
import {analyze} from '../scoring.js';
const p={name:'Test',price:50,cost:10,shipping:5,fees:5,adCost:10,monthlySales:1000,reviews:0};
test('includes shipping, fees and advertising in profit',()=>{const r=analyze(p);assert.equal(r.profit,20);assert.equal(r.margin,40);assert.equal(r.score,100);});
test('flags losses even with high demand',()=>{assert.equal(analyze({...p,cost:80}).verdict,'Unprofitable');});
test('rejects missing, negative and nonnumeric inputs',()=>{for(const value of [undefined,'',-1,'bad',Infinity])assert.throws(()=>analyze({...p,cost:value}));});
test('competition reduces score',()=>{assert.ok(analyze({...p,reviews:2000}).score<analyze(p).score);});
