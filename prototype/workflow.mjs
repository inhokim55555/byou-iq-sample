const normalizedStatus = (value) => String(value || "").trim().toLowerCase();

export const canApproveDeliverable = (deliverable) => {
  const versions = Array.isArray(deliverable?.versions) ? deliverable.versions : [];
  const latestVersion = versions.at(-1);
  return Boolean(latestVersion?.id);
};
export const calculateCreatorWorkflowStatus = (deliverables) => {
  const records = Array.isArray(deliverables) ? deliverables.filter(Boolean) : [];
  if (!records.length) return "Creating Content";

  const statuses = records.map((deliverable) => normalizedStatus(deliverable.status));
  const isPosted = (status) => /published|posted|complete/.test(status);
  const isApproved = (status) => /approved/.test(status) || isPosted(status);
  const isRevising = (status) => /revising|revision/.test(status);
  const postedCount = statuses.filter(isPosted).length;

  if (postedCount === statuses.length) return "Complete";
  if (postedCount > 0) return "Partially Posted";
  if (statuses.some(isRevising)) return "Revising";
  if (statuses.every(isApproved)) return "Approved";
  return "Creating Content";
};
