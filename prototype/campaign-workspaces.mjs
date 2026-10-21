// Explicit server relationships only. Similar names never establish a workspace.
export function campaignWorkspaceMembers(campaign = {}) {
  const supplied = Array.isArray(campaign.workspaceMembers) ? campaign.workspaceMembers : [];
  const seen = new Set();
  const members = supplied.filter(member => {
    if (!member || typeof member.id !== 'string' || !member.id || seen.has(member.id)) return false;
    seen.add(member.id);
    return true;
  });
  return members.length ? members : campaign.id ? [campaign] : [];
}

export function workspaceTypeLabel(type, name) {
  // Keep an explicitly named experience group recognizable without changing
  // its saved campaign type, assignments, templates, or workflow behavior.
  if (['seeding','other'].includes(String(type || '').toLowerCase()) && /(?:^|\s)체험단$/u.test(String(name || '').trim())) return '체험단';
  return ({paid: 'Paid', seeding: 'Seeding', affiliate: 'Affiliate', other: 'Other'})[String(type || '').toLowerCase()] || 'Type not recorded';
}

export function workspaceMemberLabel(member, members) {
  const type = workspaceTypeLabel(member.type, member.name);
  const repeated = members.filter(other => String(other.type || '').toLowerCase() === String(member.type || '').toLowerCase()).length > 1;
  return repeated ? `${type} · ${member.name || 'Campaign name not recorded'}` : type;
}

export function workspaceRootMember(campaign) {
  const rootId = campaign.workspaceId || campaign.workspaceParentId || campaign.id;
  return campaignWorkspaceMembers(campaign).find(member => member.id === rootId) || null;
}
