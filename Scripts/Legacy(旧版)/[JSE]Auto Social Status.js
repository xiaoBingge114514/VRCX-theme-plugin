/* %AppData%/VRCX/custom.js */
/* 使用脚本后果自负！ */
/* 脚本：ExtensionJSManager + Auto Social Status */

(() => {
    'use strict';

    // ==================== ExtensionJSManager ====================
    const ExtensionJSManager = (() => {
        const state = {
            initialized: false,
            observer: null,
            checkInterval: null,
            isCollapsed: false,
            userInteracted: false,
            isProcessing: false // 添加：防止重入
        };

        function createExtensionCategory() {
            if (document.querySelector('[data-category="extension-js"]')) {
                return null;
            }

            const category = document.createElement('div');
            category.className = 'tool-category';
            category.setAttribute('data-category', 'extension-js');
            
            category.innerHTML = `
                <div data-v-823ccd7a class="category-header text-2xl">
                    <svg data-v-823ccd7a xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide rotation-transition lucide-chevron-down-icon lucide-chevron-down">
                        <path d="m6 9 6 6 6-6"></path>
                    </svg>
                    <span data-v-823ccd7a class="category-title">扩展JS</span>
                </div>
                <div data-v-823ccd7a class="tools-grid"></div>
                <br>
            `;

            const header = category.querySelector('.category-header');
            const grid = category.querySelector('.tools-grid');
            
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                state.userInteracted = true;
                state.isCollapsed = grid.style.display !== 'none';
                
                if (state.isCollapsed) {
                    grid.style.display = 'none';
                    header.classList.add('collapsed');
                    header.querySelector('svg').style.transform = 'rotate(-90deg)';
                } else {
                    grid.style.display = '';
                    header.classList.remove('collapsed');
                    header.querySelector('svg').style.transform = 'rotate(0deg)';
                }
            });

            return category;
        }

        function moveCardsToCategory(targetCategory) {
            const grid = targetCategory.querySelector('.tools-grid');
            if (!grid) return 0;

            // 收集所有扩展工具卡片（id 以 -tool 结尾）
            const allCards = Array.from(document.querySelectorAll('[id$="-tool"]'));
            let movedCount = 0;
            
            allCards.forEach(card => {
                // 如果卡片已经在正确的位置，跳过
                if (card.parentElement === grid) {
                    return;
                }
                
                // 移动卡片（不触发观察，因为我们在处理中）
                try {
                    if (card.parentElement) {
                        card.remove();
                    }
                    grid.appendChild(card);
                    movedCount++;
                    console.log('[ExtensionJS] Moved card:', card.id);
                } catch (e) {
                    console.warn('[ExtensionJS] Failed to move card:', card.id, e);
                }
            });

            return movedCount;
        }

        function insertAtTop(newCategory) {
            const container = document.querySelector('.tool-categories');
            if (!container) return false;

            const firstCategory = container.querySelector('.tool-category');
            if (firstCategory) {
                container.insertBefore(newCategory, firstCategory);
            } else {
                container.appendChild(newCategory);
            }
            
            return true;
        }

        function applyCollapsedState(category) {
            if (!state.userInteracted) return;

            const grid = category.querySelector('.tools-grid');
            const header = category.querySelector('.category-header');
            const svg = header?.querySelector('svg');
            
            if (!grid || !header) return;

            if (state.isCollapsed) {
                grid.style.display = 'none';
                header.classList.add('collapsed');
                if (svg) svg.style.transform = 'rotate(-90deg)';
            } else {
                grid.style.display = '';
                header.classList.remove('collapsed');
                if (svg) svg.style.transform = 'rotate(0deg)';
            }
        }

        function ensureExtensionCategory() {
            // 防止重入
            if (state.isProcessing) return;
            state.isProcessing = true;

            try {
                const onTools = String(location.hash || '').includes('/tools');
                if (!onTools) return;

                const container = document.querySelector('.tool-categories');
                if (!container) return;

                let category = document.querySelector('[data-category="extension-js"]');
                let isNewCategory = false;
                
                if (!category) {
                    category = createExtensionCategory();
                    if (!category) return;
                    
                    if (!insertAtTop(category)) {
                        console.warn('[ExtensionJS] Failed to insert category');
                        return;
                    }
                    isNewCategory = true;
                    console.log('[ExtensionJS] Created new category');
                }

                moveCardsToCategory(category);
                
                if (!isNewCategory) {
                    applyCollapsedState(category);
                }
            } finally {
                state.isProcessing = false;
            }
        }

        function startWatching() {
            ensureExtensionCategory();

            state.checkInterval = setInterval(() => {
                ensureExtensionCategory();
            }, 1000);

            state.observer = new MutationObserver((mutations) => {
                // 检查是否真的有卡片需要移动
                const extensionCat = document.querySelector('[data-category="extension-js"]');
                const cards = document.querySelectorAll('[id$="-tool"]');
                
                const needsFix = !extensionCat || Array.from(cards).some(card => 
                    card.closest('[data-category="extension-js"]') === null
                );
                
                if (needsFix) {
                    ensureExtensionCategory();
                }
            });

            state.observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        function destroy() {
            if (state.checkInterval) {
                clearInterval(state.checkInterval);
                state.checkInterval = null;
            }
            if (state.observer) {
                state.observer.disconnect();
                state.observer = null;
            }
            
            const extensionCat = document.querySelector('[data-category="extension-js"]');
            if (extensionCat) {
                extensionCat.remove();
            }
            
            state.userInteracted = false;
            state.isCollapsed = false;
            state.isProcessing = false;
        }

        function init() {
            if (state.initialized) return;
            state.initialized = true;
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', startWatching);
            } else {
                startWatching();
            }
            
            console.log('[ExtensionJS] Manager initialized');
        }

        return { init, destroy, ensure: ensureExtensionCategory };
    })();

    // ==================== AutoStatus 主逻辑 ====================
    const GLOBAL_KEY = '__VRCX_AUTO_STATUS_CUSTOM__';
    if (window[GLOBAL_KEY] && typeof window[GLOBAL_KEY].destroy === 'function') {
        window[GLOBAL_KEY].destroy();
    }

    const CONFIG_KEY = 'VRCX_custom_autoStatus';
    const ROOM_TYPES = [
        'Public',
        'Friends',
        'Friends+',
        'Invite',
        'Invite+',
        'Group Public',
        'Group Plus',
        'Group'
    ];

    const STATUS_OPTIONS = [
        { value: 'active', label: 'Online', dotClass: 'online' },
        { value: 'join me', label: 'Join Me', dotClass: 'joinme' },
        { value: 'ask me', label: 'Ask Me', dotClass: 'askme' },
        { value: 'busy', label: 'Busy', dotClass: 'busy' }
    ];

    const defaultConfig = {
        enabled: false,
        debug: false,
        priority: 'room',
        time: {
            enabled: false,
            rules: [{ start: '09:00', end: '18:00', status: 'active', text: 'Working' }]
        },
        room: {
            enabled: false,
            rules: [{ roomTypes: ['Public', 'Group'], status: 'busy', text: 'In Public' }]
        }
    };

    const autoState = {
        config: clone(defaultConfig),
        lastApplied: null,
        ready: false,
        ui: {},
        intervalId: null,
        saveTimer: null,
        initialized: false,
        cardCreated: false // 新增：标记卡片是否已创建
    };

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function mergeConfig(base, patch) {
        if (!patch || typeof patch !== 'object') {
            return clone(base);
        }
        const next = clone(base);
        if (typeof patch.enabled === 'boolean') next.enabled = patch.enabled;
        if (typeof patch.debug === 'boolean') next.debug = patch.debug;
        if (patch.priority === 'room' || patch.priority === 'time') next.priority = patch.priority;

        if (patch.time && typeof patch.time === 'object') {
            if (typeof patch.time.enabled === 'boolean') next.time.enabled = patch.time.enabled;
            if (Array.isArray(patch.time.rules)) {
                next.time.rules = patch.time.rules
                    .map((r) => ({
                        start: sanitizeTime(r.start),
                        end: sanitizeTime(r.end),
                        status: normalizeStatus(r.status),
                        text: String(r.text || '').slice(0, 32)
                    }))
                    .filter((r) => r.start && r.end);
            }
        }

        if (patch.room && typeof patch.room === 'object') {
            if (typeof patch.room.enabled === 'boolean') next.room.enabled = patch.room.enabled;
            if (Array.isArray(patch.room.rules)) {
                next.room.rules = patch.room.rules
                    .map((r) => ({
                        roomTypes: Array.isArray(r.roomTypes)
                            ? r.roomTypes.filter((x) => ROOM_TYPES.includes(x))
                            : [],
                        status: normalizeStatus(r.status),
                        text: String(r.text || '').slice(0, 32)
                    }))
                    .filter((r) => r.roomTypes.length > 0);
            }
        }

        if (!Array.isArray(next.time.rules) || next.time.rules.length === 0) {
            next.time.rules = clone(defaultConfig.time.rules);
        }
        if (!Array.isArray(next.room.rules) || next.room.rules.length === 0) {
            next.room.rules = clone(defaultConfig.room.rules);
        }
        return next;
    }

    function sanitizeTime(value) {
        const raw = String(value || '').trim();
        if (!/^\d{2}:\d{2}$/.test(raw)) {
            return '';
        }
        const [h, m] = raw.split(':').map(Number);
        if (h < 0 || h > 23 || m < 0 || m > 59) {
            return '';
        }
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    function normalizeStatus(status) {
        const s = String(status || '').trim().toLowerCase();
        if (s === 'online') return 'active';
        if (s === 'ask') return 'ask me';
        if (s === 'joinme') return 'join me';
        if (STATUS_OPTIONS.some((x) => x.value === s)) return s;
        return 'active';
    }

    async function loadConfig() {
        const repo = window.configRepository;
        if (!repo || typeof repo.getString !== 'function') {
            autoState.config = clone(defaultConfig);
            return;
        }
        try {
            const text = await repo.getString(CONFIG_KEY, '');
            if (!text) {
                autoState.config = clone(defaultConfig);
                return;
            }
            autoState.config = mergeConfig(defaultConfig, JSON.parse(text));
        } catch (err) {
            console.error('[AutoStatus] load config failed', err);
            autoState.config = clone(defaultConfig);
        }
    }

    function saveConfigDebounced() {
        window.clearTimeout(autoState.saveTimer);
        autoState.saveTimer = window.setTimeout(saveConfig, 200);
    }

    async function saveConfig() {
        const repo = window.configRepository;
        if (!repo || typeof repo.setString !== 'function') {
            return;
        }
        try {
            await repo.setString(CONFIG_KEY, JSON.stringify(autoState.config));
        } catch (err) {
            console.error('[AutoStatus] save config failed', err);
        }
    }

    function getPiniaStore(name) {
        const pinia = window.$pinia;
        if (!pinia) return null;
        if (pinia._s && typeof pinia._s.get === 'function') {
            const store = pinia._s.get(name);
            if (store) return store;
        }
        if (pinia[name]) return pinia[name];
        return null;
    }

    function readCurrentRoomType() {
        let userStore = getPiniaStore('User');

        if (!userStore && window.$pinia) {
            userStore = window.$pinia.user || window.$pinia.User;
        }

        if (!userStore) return null;
        const currentUser = userStore.currentUser;
        if (!currentUser) return null;

        const cachedUser = userStore.cachedUsers?.get?.(currentUser.id);
        if (cachedUser?.$location && typeof cachedUser.$location === 'object') {
            const loc = cachedUser.$location;
            return {
                roomType: getRoomTypeFromLocation(loc),
                worldId: loc.worldId || ''
            };
        }

        const locationTag = currentUser.$locationTag || currentUser.presence?.world || '';
        if (!locationTag || locationTag === 'traveling' || locationTag === 'offline' || locationTag === 'private' || locationTag.startsWith('local')) {
            return null;
        }

        const parsed = parseLocation(locationTag);
        if (!parsed || !parsed.accessType) return null;

        return {
            roomType: getRoomTypeFromParsed(parsed),
            worldId: parsed.worldId
        };
    }

    function getRoomTypeFromLocation(loc) {
        if (!loc) return null;
        if (loc.accessType === 'group') {
            if (loc.groupAccessType === 'public' || loc.accessTypeName === 'groupPublic') return 'Group Public';
            if (loc.groupAccessType === 'plus' || loc.accessTypeName === 'groupPlus') return 'Group Plus';
            return 'Group';
        }
        if (loc.accessType === 'invite' && loc.canRequestInvite) return 'Invite+';
        const typeMap = {
            'public': 'Public',
            'friends': 'Friends',
            'friends+': 'Friends+',
            'invite': 'Invite'
        };
        return typeMap[loc.accessType] || null;
    }

    function getRoomTypeFromParsed(parsed) {
        if (!parsed || !parsed.accessType) return null;
        if (parsed.accessType === 'group') {
            if (parsed.groupAccessType === 'public') return 'Group Public';
            if (parsed.groupAccessType === 'plus') return 'Group Plus';
            return 'Group';
        }
        const typeMap = {
            'public': 'Public',
            'friends': 'Friends',
            'friends+': 'Friends+',
            'invite': 'Invite',
            'invite+': 'Invite+'
        };
        return typeMap[parsed.accessType] || null;
    }

    function parseLocation(tag) {
        const text = String(tag || '');
        const ctx = {
            accessType: '',
            groupAccessType: null,
            worldId: null
        };
        if (!text || text.startsWith('local') || !text.includes(':')) {
            return ctx;
        }
        const parts = text.split(':');
        if (parts.length < 2) {
            return ctx;
        }
        ctx.worldId = parts[0];
        const instance = parts.slice(1).join(':');
        const chunks = instance.split('~');
        let hiddenId = null;
        let privateId = null;
        let friendsId = null;
        let groupId = null;

        for (let i = 1; i < chunks.length; i += 1) {
            const seg = chunks[i];
            const p1 = seg.indexOf('(');
            const p2 = seg.lastIndexOf(')');
            const key = p1 >= 0 ? seg.slice(0, p1) : seg;
            const value = p1 >= 0 && p2 > p1 ? seg.slice(p1 + 1, p2) : '';
            if (key === 'hidden') hiddenId = value;
            if (key === 'private') privateId = value;
            if (key === 'friends') friendsId = value;
            if (key === 'group') groupId = value;
            if (key === 'groupAccessType') ctx.groupAccessType = value;
        }

        ctx.accessType = 'public';
        if (privateId !== null) {
            ctx.accessType = instance.includes('~canRequestInvite') ? 'invite+' : 'invite';
        } else if (friendsId !== null) {
            ctx.accessType = 'friends';
        } else if (hiddenId !== null) {
            ctx.accessType = 'friends+';
        } else if (groupId !== null) {
            ctx.accessType = 'group';
        }
        return ctx;
    }

    function nowTimeHHMM() {
        const d = new Date();
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    }

    function isTimeInRange(now, start, end) {
        if (start <= end) {
            return now >= start && now < end;
        }
        return now >= start || now < end;
    }

    function evaluateTimeRule() {
        const cfg = autoState.config;
        if (!cfg.time.enabled) return null;
        const now = nowTimeHHMM();
        for (const rule of cfg.time.rules) {
            const start = sanitizeTime(rule.start);
            const end = sanitizeTime(rule.end);
            if (!start || !end) continue;
            if (isTimeInRange(now, start, end)) {
                return {
                    source: 'time',
                    status: normalizeStatus(rule.status),
                    text: String(rule.text || '').slice(0, 32),
                    rule
                };
            }
        }
        return null;
    }

    function evaluateRoomRule(currentRoomType) {
        const cfg = autoState.config;
        if (!cfg.room.enabled || !currentRoomType) return null;
        for (const rule of cfg.room.rules) {
            if (!Array.isArray(rule.roomTypes)) continue;
            if (rule.roomTypes.includes(currentRoomType)) {
                return {
                    source: 'room',
                    status: normalizeStatus(rule.status),
                    text: String(rule.text || '').slice(0, 32),
                    rule
                };
            }
        }
        return null;
    }

    function pickFinalRule(timeMatch, roomMatch) {
        if (!timeMatch && !roomMatch) return null;
        if (timeMatch && !roomMatch) return timeMatch;
        if (!timeMatch && roomMatch) return roomMatch;
        return autoState.config.priority === 'time' ? timeMatch : roomMatch;
    }

    function getCurrentStatusSnapshot() {
        const userStore = getPiniaStore('User');
        if (!userStore || !userStore.currentUser) {
            return { status: '', text: '' };
        }
        return {
            status: normalizeStatus(userStore.currentUser.status),
            text: String(userStore.currentUser.statusDescription || '')
        };
    }

    async function applySocialStatus(payload) {
        const requestApi = window.request && window.request.userRequest;
        if (!requestApi || typeof requestApi.saveCurrentUser !== 'function') {
            return false;
        }
        await requestApi.saveCurrentUser({
            status: normalizeStatus(payload.status),
            statusDescription: String(payload.text || '').slice(0, 32)
        });
        return true;
    }

    function debugLog(data) {
        if (!autoState.config.debug) return;
        console.log('[AutoStatus] evaluate');
        console.log('  worldId:', data.worldId || 'null');
        console.log('  roomType:', data.roomType || 'null');
        console.log('  timeMatched:', data.timeMatched);
        console.log('  roomMatched:', data.roomMatched);
        console.log('  finalRule:', data.finalRule);
        console.log('  applied:', data.applied);
    }

    async function evaluateAndApply() {
        if (!autoState.config.enabled) {
            return;
        }
        const roomInfo = readCurrentRoomType();
        const roomType = roomInfo ? roomInfo.roomType : null;
        const worldId = roomInfo ? roomInfo.worldId : null;
        const timeMatch = evaluateTimeRule();
        const roomMatch = evaluateRoomRule(roomType);
        const finalRule = pickFinalRule(timeMatch, roomMatch);

        let applied = false;
        if (finalRule) {
            const next = {
                status: normalizeStatus(finalRule.status),
                text: String(finalRule.text || '').slice(0, 32)
            };
            const key = `${next.status}:::${next.text}`;
            const curr = getCurrentStatusSnapshot();
            const currentKey = `${curr.status}:::${curr.text}`;

            if (autoState.lastApplied === key || currentKey === key) {
                applied = false;
            } else {
                try {
                    await applySocialStatus(next);
                    autoState.lastApplied = key;
                    applied = true;
                } catch (err) {
                    console.error('[AutoStatus] apply failed', err);
                }
            }
        }

        debugLog({
            timeMatched: Boolean(timeMatch),
            roomMatched: Boolean(roomMatch),
            finalRule,
            applied,
            worldId,
            roomType
        });
    }

    // ==================== UI 部分 ====================
    function ensureStyle() {
        if (document.getElementById('auto-status-style')) return;
        const style = document.createElement('style');
        style.id = 'auto-status-style';
        style.textContent = `
#auto-status-tool { cursor: pointer; }
#auto-status-tool .tool-content { cursor: pointer; }
#auto-status-modal-root { position: fixed; inset: 0; z-index: 9999; display: none; }
#auto-status-modal-root.open { display: block; }
#auto-status-modal-root .as-overlay {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--foreground, #000) 25%, transparent);
}
#auto-status-modal-root .as-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(960px, calc(100vw - 24px));
  max-height: calc(100vh - 24px);
  overflow: auto;
  background: var(--card, #fff);
  color: var(--foreground, #111);
  border: 1px solid var(--border, #ddd);
  border-radius: 12px;
  box-shadow: 0 10px 32px color-mix(in srgb, var(--foreground, #000) 18%, transparent);
  padding: 16px;
}
#auto-status-modal-root .as-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
#auto-status-modal-root .as-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin: 8px 0; }
#auto-status-modal-root .as-section {
  border: 1px solid var(--border, #ddd);
  border-radius: 8px;
  padding: 10px;
  margin: 8px 0;
  background: color-mix(in srgb, var(--card, #fff) 92%, var(--muted, #eee));
}
#auto-status-modal-root .as-subtitle { font-weight: 600; margin-bottom: 6px; }
#auto-status-modal-root input,
#auto-status-modal-root select,
#auto-status-modal-root button,
#auto-status-modal-root textarea {
  background: var(--background, #fff);
  color: var(--foreground, #111);
  border: 1px solid var(--border, #ddd);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 13px;
}
#auto-status-modal-root button { cursor: pointer; }
#auto-status-modal-root button:hover {
  background: color-mix(in srgb, var(--accent, #f2f2f2) 90%, transparent);
}
#auto-status-modal-root .as-pill {
  border: 1px solid var(--border, #ddd);
  border-radius: 999px;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
#auto-status-modal-root .as-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
#auto-status-modal-root .as-disabled { opacity: .6; pointer-events: none; }
#auto-status-modal-root .as-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
@media (max-width: 800px) {
  #auto-status-modal-root .as-grid { grid-template-columns: repeat(1, minmax(0, 1fr)); }
}
        `;
        document.head.appendChild(style);
    }

    function createStatusSelect(value, onChange) {
        const select = document.createElement('select');
        for (const item of STATUS_OPTIONS) {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.label;
            if (item.value === value) option.selected = true;
            select.appendChild(option);
        }
        select.addEventListener('change', () => onChange(select.value));
        return select;
    }

    function createSwitch(checked, onChange) {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = Boolean(checked);
        input.addEventListener('change', () => onChange(input.checked));
        return input;
    }

    function createTimeRuleRow(rule, index, listRoot) {
        const row = document.createElement('div');
        row.className = 'as-row';

        const start = document.createElement('input');
        start.type = 'time';
        start.value = sanitizeTime(rule.start) || '09:00';
        start.addEventListener('change', () => {
            autoState.config.time.rules[index].start = sanitizeTime(start.value) || '00:00';
            saveConfigDebounced();
        });

        const end = document.createElement('input');
        end.type = 'time';
        end.value = sanitizeTime(rule.end) || '18:00';
        end.addEventListener('change', () => {
            autoState.config.time.rules[index].end = sanitizeTime(end.value) || '00:00';
            saveConfigDebounced();
        });

        const statusSelect = createStatusSelect(normalizeStatus(rule.status), (value) => {
            autoState.config.time.rules[index].status = normalizeStatus(value);
            saveConfigDebounced();
        });

        const text = document.createElement('input');
        text.type = 'text';
        text.maxLength = 32;
        text.placeholder = '状态名';
        text.value = String(rule.text || '');
        text.addEventListener('input', () => {
            autoState.config.time.rules[index].text = String(text.value || '').slice(0, 32);
            saveConfigDebounced();
        });

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '删除';
        removeBtn.addEventListener('click', () => {
            autoState.config.time.rules.splice(index, 1);
            if (!autoState.config.time.rules.length) {
                autoState.config.time.rules.push({ start: '09:00', end: '18:00', status: 'active', text: 'Working' });
            }
            saveConfigDebounced();
            renderDialogBody(listRoot);
        });

        row.append('时间段', start, '到', end, statusSelect, text, removeBtn);
        return row;
    }

    function createRoomTypesEditor(rule, index, listRoot) {
        const wrapper = document.createElement('div');
        wrapper.className = 'as-grid';

        ROOM_TYPES.forEach((typeName) => {
            const pill = document.createElement('label');
            pill.className = 'as-pill';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = Array.isArray(rule.roomTypes) && rule.roomTypes.includes(typeName);
            cb.addEventListener('change', () => {
                const target = autoState.config.room.rules[index];
                const set = new Set(Array.isArray(target.roomTypes) ? target.roomTypes : []);
                if (cb.checked) {
                    set.add(typeName);
                } else {
                    set.delete(typeName);
                }
                target.roomTypes = ROOM_TYPES.filter((x) => set.has(x));
                saveConfigDebounced();
            });

            const span = document.createElement('span');
            span.textContent = typeName;
            pill.append(cb, span);
            wrapper.appendChild(pill);
        });

        return wrapper;
    }

    function createRoomRuleRow(rule, index, listRoot) {
        const box = document.createElement('div');
        box.className = 'as-section';

        const head = document.createElement('div');
        head.className = 'as-subtitle';
        head.textContent = `房间规则 #${index + 1}`;

        const line = document.createElement('div');
        line.className = 'as-row';

        const statusSelect = createStatusSelect(normalizeStatus(rule.status), (value) => {
            autoState.config.room.rules[index].status = normalizeStatus(value);
            saveConfigDebounced();
        });

        const text = document.createElement('input');
        text.type = 'text';
        text.maxLength = 32;
        text.placeholder = '状态名';
        text.value = String(rule.text || '');
        text.addEventListener('input', () => {
            autoState.config.room.rules[index].text = String(text.value || '').slice(0, 32);
            saveConfigDebounced();
        });

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '删除';
        removeBtn.addEventListener('click', () => {
            autoState.config.room.rules.splice(index, 1);
            if (!autoState.config.room.rules.length) {
                autoState.config.room.rules.push({ roomTypes: ['Public'], status: 'active', text: '' });
            }
            saveConfigDebounced();
            renderDialogBody(listRoot);
        });

        line.append('状态', statusSelect, text, removeBtn);
        box.append(head, createRoomTypesEditor(rule, index, listRoot), line);
        return box;
    }

    function renderDialogBody(root) {
        if (!root) return;
        root.innerHTML = '';

        const cfg = autoState.config;

        const top = document.createElement('div');
        top.className = 'as-row';
        const enabledSwitch = createSwitch(cfg.enabled, (value) => {
            cfg.enabled = value;
            saveConfigDebounced();
            renderDialogBody(root);
        });
        const enabledLabel = document.createElement('span');
        enabledLabel.textContent = '是否启用';

        const debugSwitch = createSwitch(cfg.debug, (value) => {
            cfg.debug = value;
            saveConfigDebounced();
        });
        const debugLabel = document.createElement('span');
        debugLabel.textContent = '调试日志';

        const prioritySel = document.createElement('select');
        const roomOpt = document.createElement('option');
        roomOpt.value = 'room';
        roomOpt.textContent = '优先级: 房间 > 时间';
        const timeOpt = document.createElement('option');
        timeOpt.value = 'time';
        timeOpt.textContent = '优先级: 时间 > 房间';
        prioritySel.append(roomOpt, timeOpt);
        prioritySel.value = cfg.priority;
        prioritySel.addEventListener('change', () => {
            cfg.priority = prioritySel.value === 'time' ? 'time' : 'room';
            saveConfigDebounced();
        });

        top.append(enabledSwitch, enabledLabel, debugSwitch, debugLabel, prioritySel);
        root.appendChild(top);

        const bodyWrapper = document.createElement('div');
        if (!cfg.enabled) {
            bodyWrapper.className = 'as-disabled';
        }

        const timeSection = document.createElement('div');
        timeSection.className = 'as-section';
        const timeHeader = document.createElement('div');
        timeHeader.className = 'as-row';
        const timeSwitch = createSwitch(cfg.time.enabled, (value) => {
            cfg.time.enabled = value;
            saveConfigDebounced();
            renderDialogBody(root);
        });
        const timeTitle = document.createElement('span');
        timeTitle.textContent = '根据时间改';
        timeHeader.append(timeSwitch, timeTitle);
        timeSection.appendChild(timeHeader);

        const timeRuleList = document.createElement('div');
        if (!cfg.time.enabled) {
            timeRuleList.className = 'as-disabled';
        }
        cfg.time.rules.forEach((rule, idx) => {
            timeRuleList.appendChild(createTimeRuleRow(rule, idx, root));
        });
        const addTimeBtn = document.createElement('button');
        addTimeBtn.textContent = '+ 添加更多';
        addTimeBtn.addEventListener('click', () => {
            cfg.time.rules.push({ start: '00:00', end: '23:59', status: 'active', text: '' });
            saveConfigDebounced();
            renderDialogBody(root);
        });
        timeRuleList.appendChild(addTimeBtn);
        timeSection.appendChild(timeRuleList);

        const roomSection = document.createElement('div');
        roomSection.className = 'as-section';
        const roomHeader = document.createElement('div');
        roomHeader.className = 'as-row';
        const roomSwitch = createSwitch(cfg.room.enabled, (value) => {
            cfg.room.enabled = value;
            saveConfigDebounced();
            renderDialogBody(root);
        });
        const roomTitle = document.createElement('span');
        roomTitle.textContent = '根据房间改';
        roomHeader.append(roomSwitch, roomTitle);
        roomSection.appendChild(roomHeader);

        const roomRuleList = document.createElement('div');
        if (!cfg.room.enabled) {
            roomRuleList.className = 'as-disabled';
        }
        cfg.room.rules.forEach((rule, idx) => {
            roomRuleList.appendChild(createRoomRuleRow(rule, idx, root));
        });
        const addRoomBtn = document.createElement('button');
        addRoomBtn.textContent = '+ 添加更多';
        addRoomBtn.addEventListener('click', () => {
            cfg.room.rules.push({ roomTypes: ['Public'], status: 'active', text: '' });
            saveConfigDebounced();
            renderDialogBody(root);
        });
        roomRuleList.appendChild(addRoomBtn);
        roomSection.appendChild(roomRuleList);

        bodyWrapper.append(timeSection, roomSection);
        root.appendChild(bodyWrapper);
    }

    function openDialog() {
        if (!autoState.ui.modalRoot) return;
        renderDialogBody(autoState.ui.dialogBody);
        autoState.ui.modalRoot.classList.add('open');
    }

    function closeDialog() {
        if (!autoState.ui.modalRoot) return;
        autoState.ui.modalRoot.classList.remove('open');
    }

    function ensureDialog() {
        if (document.getElementById('auto-status-modal-root')) {
            autoState.ui.modalRoot = document.getElementById('auto-status-modal-root');
            autoState.ui.dialogBody = document.getElementById('auto-status-dialog-body');
            return;
        }

        const root = document.createElement('div');
        root.id = 'auto-status-modal-root';

        const overlay = document.createElement('div');
        overlay.className = 'as-overlay';
        overlay.addEventListener('click', closeDialog);

        const dialog = document.createElement('div');
        dialog.className = 'as-dialog';

        const title = document.createElement('div');
        title.className = 'as-title';
        title.textContent = 'Auto Social Status';

        const body = document.createElement('div');
        body.id = 'auto-status-dialog-body';

        const footer = document.createElement('div');
        footer.className = 'as-footer';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '关闭';
        closeBtn.addEventListener('click', closeDialog);

        footer.appendChild(closeBtn);
        dialog.append(title, body, footer);
        root.append(overlay, dialog);
        document.body.appendChild(root);

        autoState.ui.modalRoot = root;
        autoState.ui.dialogBody = body;
    }

    function createToolCard() {
        const card = document.createElement('div');
        card.id = 'auto-status-tool';
        // 添加 data-v-823ccd7a 以匹配 VRCX 样式
        card.setAttribute('data-v-823ccd7a', '');
        card.className = 'bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm tool-card p-0 gap-0';
        card.innerHTML = `
<div data-v-823ccd7a class="tool-content">
  <div data-v-823ccd7a class="tool-icon text-2xl">🟢</div>
  <div data-v-823ccd7a class="tool-info">
    <div data-v-823ccd7a class="tool-name">Auto Social Status</div>
    <div data-v-823ccd7a class="tool-description">每 5 秒根据时间/房间自动改状态</div>
  </div>
</div>`;
        card.addEventListener('click', openDialog);
        return card;
    }

    // ==================== 关键修改：只创建一次卡片，不再重复检查 ====================
    function createToolCardOnce() {
        // 如果已经创建过，直接返回
        if (autoState.cardCreated) {
            return;
        }
        
        // 检查是否已存在（可能之前已经创建）
        if (document.getElementById('auto-status-tool')) {
            autoState.cardCreated = true;
            return;
        }

        const card = createToolCard();
        document.body.appendChild(card);
        autoState.cardCreated = true;
        console.log('[AutoStatus] Card created once');
    }

    function ensureUi() {
        ensureStyle();
        ensureDialog();
        createToolCardOnce(); // 只创建一次
    }

    function startLoop() {
        if (autoState.intervalId) {
            window.clearInterval(autoState.intervalId);
        }
        autoState.intervalId = window.setInterval(() => {
            evaluateAndApply().catch((err) => {
                console.error('[AutoStatus] evaluate failed', err);
            });
        }, 5000);
    }

    // ==================== 初始化 ====================
    async function bootstrap() {
        if (autoState.initialized) return;
        autoState.initialized = true;

        // 1. 先启动 ExtensionJSManager（创建分类并监听）
        ExtensionJSManager.init();

        // 2. 加载配置
        await loadConfig();

        // 3. 创建 UI（只创建一次卡片）
        ensureUi();
        
        // 4. 启动状态循环
        startLoop();

        autoState.ready = true;
        console.log('[AutoStatus] initialized');
    }

    function destroy() {
        if (autoState.intervalId) {
            window.clearInterval(autoState.intervalId);
            autoState.intervalId = null;
        }
        if (autoState.saveTimer) {
            window.clearTimeout(autoState.saveTimer);
            autoState.saveTimer = null;
        }
        const style = document.getElementById('auto-status-style');
        if (style) style.remove();
        const modal = document.getElementById('auto-status-modal-root');
        if (modal) modal.remove();
        const tool = document.getElementById('auto-status-tool');
        if (tool) tool.remove();

        // 重置状态
        autoState.cardCreated = false;
        autoState.initialized = false;

        // 销毁 ExtensionJSManager
        ExtensionJSManager.destroy();
    }

    window[GLOBAL_KEY] = {
        destroy,
        evaluateAndApply,
        openDialog,
        getConfig: () => clone(autoState.config),
        setConfig: (next) => {
            autoState.config = mergeConfig(defaultConfig, next);
            saveConfigDebounced();
            if (autoState.ui.dialogBody) {
                renderDialogBody(autoState.ui.dialogBody);
            }
        }
    };

    const startWhenReady = () => {
        const isReady = Boolean(window.$pinia && window.configRepository && document.body);
        if (!isReady) {
            window.setTimeout(startWhenReady, 500);
            return;
        }
        bootstrap().catch((err) => {
            console.error('[AutoStatus] bootstrap failed', err);
        });
    };

    startWhenReady();
})();