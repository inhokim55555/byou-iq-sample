export function createLoadingTracker(onChange) {
    let pending = 0;
    const begin = () => {
        if (++pending === 1)
            onChange(true);
        let finished = false;
        return () => {
            if (!finished) {
                finished = true;
                if (--pending === 0)
                    onChange(false);
            }
        };
    };
    return {
        begin,
        async run(operation) {
            const finish = begin();
            try {
                return await operation();
            }
            finally {
                finish();
            }
        }
    };
}
export const loadingWheel = '<svg class="page-loading-wheel" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle class="page-loading-track" cx="20" cy="20" r="16"/><path d="M20 4a16 16 0 0 1 16 16"/></svg>';
export function installPageLoading(document) {
    const indicator = document.createElement('div');
    indicator.className = 'page-loading';
    indicator.hidden = true;
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-live', 'polite');
    indicator.innerHTML = `${loadingWheel}<span>Loading…</span>`;
    document.body.append(indicator);
    return createLoadingTracker(busy => { indicator.hidden = !busy; });
}
