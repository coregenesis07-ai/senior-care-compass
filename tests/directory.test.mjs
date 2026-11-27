import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.js';
const request = zip => worker.fetch(new Request('https://example.org/api/providers?zip='+zip), {});
test('invalid ZIP rejected and not cached', async()=>{const r=await request('123');assert.equal(r.status,400);assert.equal(r.headers.get('cache-control'),'no-store');});
test('ZIP outage retains exact matches and rejects other ZIPs and mailing addresses',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async url=>{url=String(url); if(url.includes('zippopotam'))return new Response('',{status:503});
 if(url.includes('xubh'))return Response.json({results:[{facility_name:'Match',zip_code:'37087',state:'TN'},{facility_name:'Wrong',zip_code:'37088',state:'TN'}]});
 if(url.includes('npiregistry'))return Response.json({results:[{basic:{organization_name:'Mail only'},addresses:[{address_purpose:'MAILING',postal_code:'37087',state:'TN'}],taxonomies:[{desc:'Pharmacy'}]}]});
 return Response.json({results:[]});};
 try {const r=await request('37087');const d=await r.json();assert.equal(r.status,200);assert.equal(d.sourcesAvailable.zip,false);assert.deepEqual(d.hospitals.map(x=>x.name),['Match']);assert.equal(d.pharmacies.length,0);}finally{globalThis.fetch=original;}
});
test('all provider sources unavailable returns 503 even with ZIP lookup',async()=>{const original=globalThis.fetch;globalThis.fetch=async url=>String(url).includes('zippopotam')?Response.json({places:[{'state abbreviation':'TN'}]}):new Response('',{status:503});try{assert.equal((await request('37087')).status,503);}finally{globalThis.fetch=original;}});
