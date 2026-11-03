import test from 'node:test';
import assert from 'node:assert/strict';
import {newCode,CODE_PATTERN,getStage,getPayment,safeEquals} from '../lib/shared.js';

test('codes CZ-XXXXX random and valid',()=>{
 const codes=new Set(Array.from({length:300},()=>newCode()));
 assert.equal(codes.size,300);
 for(const code of codes)assert.match(code,CODE_PATTERN);
});
test('invalid codes rejected',()=>{
 for(const code of ['CZ-1234','CZ-123456','CZ-DEMO1','CZ-AI0O1','1004','CZ-EXEMP EXTRA'])assert.equal(CODE_PATTERN.test(code),false);
 assert.equal(CODE_PATTERN.test('CZ-EXEMP'),true);
});
test('financial and fulfillment are separate, not fake delivery',()=>{
 let o={displayFinancialStatus:'PENDING',displayFulfillmentStatus:'FULFILLED',tags:[]};
 assert.equal(getStage(o).step,1);
 assert.equal(getPayment(o.displayFinancialStatus),'Paiement en attente');
 assert.equal(getStage({...o,tags:['CZ_EN_LIVRAISON']}).step,3);
 assert.equal(getStage({...o,tags:['CZ_LIVREE']}).step,4);
 assert.equal(getStage({...o,cancelledAt:'2026-10-28T00:00:00Z'}).step,0);
 assert.equal(getStage({...o,displayFinancialStatus:'VOIDED'}).label,'Paiement annulé — confirmation nécessaire');
});
test('constant-time compare handles length mismatch',()=>{
 assert.equal(safeEquals('a','a'),true);
 assert.equal(safeEquals('a','ab'),false);
});
