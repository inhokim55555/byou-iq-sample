// Native popovers render in the top layer; position them in viewport coordinates.
export function positionCampaignMenu(menu, invoker, viewport = window) {
  const rect = invoker.getBoundingClientRect();
  const width = menu.offsetWidth || 232;
  const left = Math.max(8, Math.min(rect.right - width, viewport.innerWidth - width - 8));
  const below = rect.bottom + 6;
  const top = below;
  menu.style.maxHeight = `${Math.max(0, viewport.innerHeight - below - 8)}px`;
  menu.style.overflowY = "auto";
  menu.style.setProperty('--ops-menu-left', `${left}px`);
  menu.style.setProperty('--ops-menu-top', `${top}px`);
}
