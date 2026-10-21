// Visual feedback only. The controller retains the reviewed campaign-add flow.
export function liftCreatorCard(card, event, count = 1, creator = {}) {
  const doc = card.ownerDocument;
  const reducedMotion = doc.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const preview = doc.createElement('div');
  preview.className = 'cl-drag-preview';
  preview.setAttribute('aria-hidden', 'true');
  preview.inert = true;
  const identity = doc.createElement('div');
  identity.className = 'cl-drag-identity';
  identity.setAttribute('data-no-translate', '');
  const name = doc.createElement('strong');
  name.textContent = creator.displayName || card.querySelector('.cl-name')?.textContent.trim() || 'Creator';
  identity.append(name);
  const handle = creator.accounts?.find(account => account.handle)?.handle;
  if (handle) {
    const username = doc.createElement('small');
    username.textContent = handle;
    identity.append(username);
  }
  preview.append(identity);
  if (count > 1) {
    const badge = doc.createElement('span');
    badge.className = 'cl-drag-count';
    badge.textContent = `${count} creators`;
    preview.append(badge);
  }
  const width = 190;
  preview.style.width = `${width}px`;
  (card.closest('#app') || card.parentNode).append(preview);
  const offsetX = width / 2;
  const offsetY = preview.getBoundingClientRect().height + 24;
  preview.style.transformOrigin = `${offsetX}px ${offsetY}px`;
  let lastX = event.clientX, lastTime = performance.now(), tilt = 0, frame = 0;
  let x = event.clientX, y = event.clientY;
  const paint = () => {
    frame = 0;
    preview.style.transform = `translate3d(${x - offsetX}px, ${y - offsetY}px, 0) rotate(${tilt}deg)`;
  };
  const follow = e => {
    // Some browsers emit a final drag event at (0, 0) when leaving the window.
    if (!e.clientX && !e.clientY) return;
    const now = performance.now();
    tilt = reducedMotion ? 0 : Math.max(-5, Math.min(5, (e.clientX - lastX) / Math.max(16, now - lastTime) * 4));
    lastX = x = e.clientX; y = e.clientY; lastTime = now;
    if (!frame) frame = requestAnimationFrame(paint);
  };
  paint();
  // Replace the browser's static translucent drag image with the live preview.
  const blank = doc.createElement('canvas');
  blank.width = blank.height = 1;
  event.dataTransfer?.setDragImage(blank, 0, 0);
  card.classList.add('is-drag-source');
  const tray = doc.querySelector('.ops-campaign-tray');
  tray?.classList.add('is-dragging');
  doc.addEventListener('dragover', follow);
  let disposed = false;
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    doc.removeEventListener('dragover', follow);
    doc.removeEventListener('dragend', cleanup);
    doc.removeEventListener('drop', cleanup);
    doc.defaultView.removeEventListener('blur', cleanup);
    preview.remove();
    card.classList.remove('is-drag-source');
    tray?.classList.remove('is-dragging');
  };
  doc.addEventListener('dragend', cleanup);
  doc.addEventListener('drop', cleanup);
  doc.defaultView.addEventListener('blur', cleanup);
  cleanup.move = follow;
  return cleanup;
}
