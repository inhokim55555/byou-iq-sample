// Outreach alone does not establish work done with a creator.
export function creatorCollaborationType(creator) {
  if (['paid', 'seeding', 'both'].includes(creator?.collaborationType)) return creator.collaborationType;
  const worked = (creator?.relationships || []).filter(row => ['participated', 'delivered'].includes(row.stage));
  const types = worked.map(row => row.campaignType || row.campaign_type);
  const paid = types.includes('paid'), seeding = types.includes('seeding');
  return paid && seeding ? 'both' : paid ? 'paid' : seeding ? 'seeding' : 'none';
}

export function matchesCreatorCollaboration(creator, filter = '') {
  const type = creatorCollaborationType(creator);
  return !filter || (filter === 'both' ? type === 'both' : type === filter || type === 'both');
}
