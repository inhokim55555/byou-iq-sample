import test from 'node:test';
import assert from 'node:assert/strict';
import {createOperationsDemoStore} from '../prototype/campaign-operations-model.mjs';
import {creatorDeals} from '../prototype/creator-deals.mjs';
test('fictional creator histories resolve to populated campaigns and paid deals',()=>{
  const store=createOperationsDemoStore();
  assert.equal(store.creators.length,18);
  assert.equal(store.read('campaigns').items.length,4);
  for(const creator of store.creators){
    assert.equal(creator.history.length,2);
    assert.equal(creator.posts.length,2);
    assert.equal(creatorDeals(creator).length,2);
    for(const h of creator.history){
      const assignment=store.read('campaign',h.campaignId).assignments.find(a=>a.id===h.id);
      assert.equal(assignment.creatorId,creator.id);
      assert.equal(assignment.feeAmount,h.agreed_fee);
      assert.equal(assignment.finance.status,'paid');
    }
    assert.match(creator.email,/@example\.invalid$/);
    assert.ok(creator.posts.every(p=>new URL(p.url).hostname==='example.invalid'));
  }
});
test('shipment queue has complete fictional addresses and non-carrier tracking identifiers',()=>{
  const rows=createOperationsDemoStore().read('shipments').items;
  assert.ok(rows.length>=20);
  for(const {shipment:s} of rows){
    for(const field of ['fullName','address','productName','brand','pic','boxSize','requestedAt','packingDate','notes'])assert.ok(s[field],field);
    assert.match(s.address,/Sample City, CA 00000/);
    assert.match(s.trackingNumber,/^DEMO-TRACK-/);
    assert.ok(s.shippingCost>0);
    assert.equal(s.sourceUrl,null);
  }
});
