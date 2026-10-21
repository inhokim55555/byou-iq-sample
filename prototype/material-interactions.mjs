const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([type="hidden"]):not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="menuitem"]',
  '[role="radio"]',
  '[role="switch"]',
  'md-checkbox',
  '[tabindex]:not([tabindex="-1"])'
].join(",");

const IDENTITY_ATTRIBUTES = [
  "id",
  "name",
  "data-action",
  "data-field",
  "data-ops-action",
  "data-ops-field",
  "data-tab",
  "data-view",
  "data-id",
  "data-creator",
  "data-campaign",
  "data-assignment",
  "aria-label"
];

const isAvailable = (element) => {
  if (!element || element.disabled || element.hidden) return false;
  if (element.closest("[hidden], [inert], [aria-hidden='true']")) return false;
  const style = globalThis.getComputedStyle?.(element);
  if (style && (style.display === "none" || style.visibility === "hidden")) return false;
  return typeof element.getClientRects !== "function" || element.getClientRects().length > 0;
};

const focusableElements = (root) => root
  ? [...root.querySelectorAll(FOCUSABLE_SELECTOR)].filter(isAvailable)
  : [];

const elementIdentity = (element) => Object.fromEntries(
  IDENTITY_ATTRIBUTES
    .map((attribute) => [attribute, element.getAttribute(attribute)])
    .filter(([, value]) => value !== null)
);

const captureControlState = (element) => {
  if (!element) return null;
  const state = {};
  if ("value" in element && element.type !== "file") state.value = element.value;
  if ("checked" in element) state.checked = element.checked;
  if ("indeterminate" in element) state.indeterminate = element.indeterminate;
  if (element.tagName === "SELECT" && element.multiple) {
    state.selectedValues = [...element.selectedOptions].map((option) => option.value);
  }
  if (typeof element.selectionStart === "number" && typeof element.selectionEnd === "number") {
    state.selection = {
      start: element.selectionStart,
      end: element.selectionEnd,
      direction: element.selectionDirection || "none"
    };
  }
  return state;
};

/** Capture a focused descendant and its editable state before replacing a rendered subtree. */
export function captureFocusSnapshot(root, element = globalThis.document?.activeElement) {
  if (!root || !element || element === globalThis.document?.body || !root.contains(element)) return null;
  const focusables = focusableElements(root);
  return {
    tagName: element.tagName,
    identity: elementIdentity(element),
    identityIndex: focusables.filter((candidate) =>
      candidate.tagName === element.tagName && Object.entries(elementIdentity(element))
        .every(([name, value]) => candidate.getAttribute(name) === value)
    ).indexOf(element),
    focusIndex: focusables.indexOf(element),
    state: captureControlState(element)
  };
}

const matchingIdentity = (root, snapshot) => {
  const pairs = Object.entries(snapshot.identity || {});
  if (!pairs.length) return null;
  const candidates = focusableElements(root).filter((candidate) =>
    pairs.every(([name, value]) => candidate.getAttribute(name) === value)
  );
  if (!candidates.length) return null;
  return candidates[snapshot.identityIndex] || candidates[0];
};

const restoreControlState = (element, state) => {
  if (!element || !state) return;
  if (state.selectedValues && element.options) {
    const values = new Set(state.selectedValues);
    for (const option of element.options) option.selected = values.has(option.value);
  } else if ("value" in state && "value" in element && element.type !== "file") {
    element.value = state.value;
  }
  if ("checked" in state && "checked" in element) element.checked = state.checked;
  if ("indeterminate" in state && "indeterminate" in element) element.indeterminate = state.indeterminate;
  if (state.selection && typeof element.setSelectionRange === "function") {
    try {
      element.setSelectionRange(state.selection.start, state.selection.end, state.selection.direction);
    } catch {
      // Some input types do not support selection ranges.
    }
  }
};

/** Restore a captured focused descendant after replacing a rendered subtree. */
export function restoreFocusSnapshot(root, snapshot) {
  if (!root || !snapshot) return false;
  const focusables = focusableElements(root);
  const element = matchingIdentity(root, snapshot) ||
    (snapshot.focusIndex >= 0 ? focusables[snapshot.focusIndex] : null);
  if (!element || typeof element.focus !== "function") return false;
  restoreControlState(element, snapshot.state);
  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
  return true;
}

const findModal = (root) => {
  if (!root) return null;
  const labelledModal = root.querySelector('[role="dialog"][aria-modal="true"]');
  if (labelledModal) return labelledModal;
  for (const dialog of root.querySelectorAll("dialog[open]")) {
    try {
      if (dialog.matches(":modal")) return dialog;
    } catch {
      if (dialog.getAttribute("aria-modal") === "true") return dialog;
    }
  }
  return null;
};

const focusElement = (element) => {
  if (!element || typeof element.focus !== "function") return;
  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
};

/**
 * Manage focus for a rendered modal subtree. `background` must contain only
 * page elements outside the modal (for example, #app beside #overlay-root).
 * Renderers call beforeRender(key), replace the subtree, then call afterRender(key).
 * Escape remains with the caller so existing close and confirmation rules stay intact.
 */
export function createModalFocusManager({ root, background = [] } = {}) {
  const resolvedRoot = typeof root === "string" ? globalThis.document?.querySelector(root) : root;
  const backgroundElements = (Array.isArray(background) ? background : [background])
    .map((element) => typeof element === "string" ? globalThis.document?.querySelector(element) : element)
    .filter(Boolean);
  let activeKey = null;
  let returnFocus = null;
  let returnFocusSnapshot = null;
  let focusSnapshot = null;
  const inertValues = new Map();

  const setBackgroundInert = (dialog) => {
    for (const element of backgroundElements) {
      if (element === resolvedRoot || element === dialog || element.contains(dialog)) continue;
      if (!inertValues.has(element)) inertValues.set(element, Boolean(element.inert));
      element.inert = true;
    }
  };

  const restoreBackground = () => {
    for (const [element, wasInert] of inertValues) element.inert = wasInert;
    inertValues.clear();
  };

  const restoreReturnFocus = () => {
    restoreBackground();
    if (returnFocus?.isConnected && !returnFocus.disabled) {
      focusElement(returnFocus);
    } else if (returnFocusSnapshot && restoreFocusSnapshot(returnFocusSnapshot.root, returnFocusSnapshot.snapshot)) {
      // The app shell may have replaced the opener; restore its current matching control.
    } else {
      const fallback = globalThis.document?.querySelector("#main-content, [data-focus-fallback]");
      if (fallback && !fallback.inert) focusElement(fallback);
    }
    returnFocus = null;
    returnFocusSnapshot = null;
    focusSnapshot = null;
  };

  const trapTab = (event) => {
    if (event.key !== "Tab") return;
    const dialog = findModal(resolvedRoot);
    if (!dialog) return;
    const focusables = focusableElements(dialog);
    if (!focusables.length) {
      event.preventDefault();
      if (!dialog.hasAttribute("tabindex")) dialog.tabIndex = -1;
      focusElement(dialog);
      return;
    }
    const activeIndex = focusables.indexOf(globalThis.document.activeElement);
    if (event.shiftKey && activeIndex <= 0) {
      event.preventDefault();
      focusElement(focusables.at(-1));
    } else if (!event.shiftKey && activeIndex === -1) {
      event.preventDefault();
      focusElement(focusables[0]);
    } else if (!event.shiftKey && activeIndex === focusables.length - 1) {
      event.preventDefault();
      focusElement(focusables[0]);
    }
  };

  globalThis.document?.addEventListener("keydown", trapTab, true);

  return {
    beforeRender(key) {
      const dialog = findModal(resolvedRoot);
      if (activeKey && key === activeKey && dialog && dialog.contains(globalThis.document.activeElement)) {
        focusSnapshot = captureFocusSnapshot(dialog);
      } else if (!activeKey && key && !returnFocus) {
        returnFocus = globalThis.document.activeElement === globalThis.document.body
          ? null
          : globalThis.document.activeElement;
        const owner = backgroundElements.find((element) => element.contains(returnFocus));
        returnFocusSnapshot = owner ? { root: owner, snapshot: captureFocusSnapshot(owner, returnFocus) } : null;
      }
    },
    afterRender(key) {
      const dialog = findModal(resolvedRoot);
      if (!dialog) {
        if (activeKey) restoreReturnFocus();
        activeKey = null;
        return false;
      }

      const nextKey = key || dialog.id || "modal";
      const sameModal = activeKey !== null && activeKey === nextKey;
      const isNativeModal = dialog.tagName === "DIALOG" && (() => {
        try { return dialog.matches(":modal"); } catch { return false; }
      })();
      if (!isNativeModal) setBackgroundInert(dialog);

      if (sameModal && restoreFocusSnapshot(dialog, focusSnapshot)) {
        focusSnapshot = null;
      } else if (!sameModal) {
        dialog.setAttribute("data-m3-enter", "");
        for (const backdrop of resolvedRoot.querySelectorAll(".drawer-backdrop, .modal-backdrop")) {
          backdrop.setAttribute("data-m3-enter", "");
        }
        const initialTarget = dialog.querySelector("[autofocus], [data-initial-focus]") ||
          [...dialog.querySelectorAll('input:not([type="hidden"]), select, textarea')].find(isAvailable) ||
          focusableElements(dialog)[0];
        if (!dialog.hasAttribute("tabindex")) dialog.tabIndex = -1;
        if (initialTarget && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(initialTarget.tagName) &&
            initialTarget.tabIndex < 0) {
          initialTarget.tabIndex = -1;
        }
        focusElement(initialTarget || dialog);
        focusSnapshot = null;
      } else if (!dialog.contains(globalThis.document.activeElement)) {
        if (!dialog.hasAttribute("tabindex")) dialog.tabIndex = -1;
        focusElement(dialog);
      }
      activeKey = nextKey;
      return true;
    }
  };
}
