import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {verifySessionToken} from '../api/checkout-code.js';

function sign(payload,secret) {
  const h=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');
  const p=Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature=createHmac('sha256',secret).update(`${h}.${p}`).digest('base64url');
  return `${h}.${p}.${signature}`;
}
const secret='TEST_SHOPIFY_SECRET_NOT_A_REAL_CREDENTIAL';
const aud='TEST_SHOPIFY_APP_CLIENT_ID';
function claims(dest='clogz-sn.myshopify.com') {
  const now=Math.floor(Date.now()/1000);
  return {aud,dest,exp:now+300,nbf:now-30,iat:now-30,jti:'test-jwt'};
}

test('Shopify signed JWT accepts the bare domain shown in official docs',()=>{
  process.env.SHOPIFY_APP_CLIENT_SECRET=secret;
  process.env.SHOPIFY_APP_CLIENT_ID=aud;
  assert.equal(verifySessionToken(sign(claims(),secret)),true);
  assert.equal(verifySessionToken(sign(claims('https://clogz-sn.myshopify.com'),secret)),true);
});
test('Shopify JWT rejects other shop, other app, expiration and invalid signature',()=>{
  process.env.SHOPIFY_APP_CLIENT_SECRET=secret;
  process.env.SHOPIFY_APP_CLIENT_ID=aud;
  assert.equal(verifySessionToken(sign(claims('another.myshopify.com'),secret)),false);
  assert.equal(verifySessionToken(sign({...claims(),aud:'wrong-app'},secret)),false);
  assert.equal(verifySessionToken(sign({...claims(),exp:Math.floor(Date.now()/1000)-1},secret)),false);
  assert.equal(verifySessionToken(sign(claims(),secret+'other')),false);
  assert.equal(verifySessionToken('not-a-jwt'),false);
});
