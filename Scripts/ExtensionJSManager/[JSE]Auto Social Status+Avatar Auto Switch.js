/* %AppData%/VRCX/custom.js */
/* 使用脚本后果自负！ */
/* 合并脚本：Auto Social Status + Avatar Auto Switch + ExtensionJSManager */

(() => {
    'use strict';

    // ==================== 全局命名空间管理 ====================
    const GLOBAL_KEYS = {
        autoStatus: '__VRCX_AUTO_STATUS_CUSTOM__',
        avatarSwitch: '__VRCX_AVATAR_SWITCH_CUSTOM__'
    };

    // 清理旧实例
    Object.values(GLOBAL_KEYS).forEach(key => {
        if (window[key] && typeof window[key].destroy === 'function') {
            window[key].destroy();
        }
    });

    // ==================== ExtensionJSManager ====================
    const ExtensionJSManager = (() => {
        const state = {
            initialized: false,
            observer: null,
            checkInterval: null,
            isCollapsed: false,
            userInteracted: false,
            isProcessing: false
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
                
                // 移动卡片
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

    // ==================== 工具函数 ====================
    const utils = {
        clone: (obj) => JSON.parse(JSON.stringify(obj)),
        
        sanitizeTime: (value) => {
            const raw = String(value || '').trim();
            if (!/^\d{2}:\d{2}$/.test(raw)) return '';
            const [h, m] = raw.split(':').map(Number);
            if (h < 0 || h > 23 || m < 0 || m > 59) return '';
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        },

        normalizeStatus: (status) => {
            const s = String(status || '').trim().toLowerCase();
            if (s === 'online') return 'active';
            if (s === 'ask') return 'ask me';
            if (s === 'joinme') return 'join me';
            const valid = ['active', 'join me', 'ask me', 'busy'];
            return valid.includes(s) ? s : 'active';
        },

        getPiniaStore: (name) => {
            const pinia = window.$pinia;
            if (!pinia) return null;
            if (pinia._s && typeof pinia._s.get === 'function') {
                const store = pinia._s.get(name);
                if (store) return store;
            }
            if (pinia[name]) return pinia[name];
            return null;
        },

        readRef: (value) => {
            if (value && typeof value === 'object' && 'value' in value) {
                return value.value;
            }
            return value;
        },

        debounce: (fn, delay) => {
            let timer;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => fn(...args), delay);
            };
        }
    };

    // ==================== 模块1: Auto Social Status ====================
    const AutoStatusModule = (() => {
        const CONFIG_KEY = 'VRCX_custom_autoStatus';
        const ROOM_TYPES = ['Public', 'Friends', 'Friends+', 'Invite', 'Invite+', 'Group Public', 'Group Plus', 'Group'];
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

        const state = {
            config: utils.clone(defaultConfig),
            lastApplied: null,
            ui: {},
            intervalId: null,
            saveTimer: null,
            initialized: false,
            cardCreated: false
        };

        function mergeConfig(base, patch) {
            if (!patch || typeof patch !== 'object') return utils.clone(base);
            const next = utils.clone(base);
            
            if (typeof patch.enabled === 'boolean') next.enabled = patch.enabled;
            if (typeof patch.debug === 'boolean') next.debug = patch.debug;
            if (patch.priority === 'room' || patch.priority === 'time') next.priority = patch.priority;

            if (patch.time?.enabled !== undefined) next.time.enabled = patch.time.enabled;
            if (Array.isArray(patch.time?.rules)) {
                next.time.rules = patch.time.rules
                    .map(r => ({
                        start: utils.sanitizeTime(r.start),
                        end: utils.sanitizeTime(r.end),
                        status: utils.normalizeStatus(r.status),
                        text: String(r.text || '').slice(0, 32)
                    }))
                    .filter(r => r.start && r.end);
            }

            if (patch.room?.enabled !== undefined) next.room.enabled = patch.room.enabled;
            if (Array.isArray(patch.room?.rules)) {
                next.room.rules = patch.room.rules
                    .map(r => ({
                        roomTypes: Array.isArray(r.roomTypes) 
                            ? r.roomTypes.filter(x => ROOM_TYPES.includes(x)) 
                            : [],
                        status: utils.normalizeStatus(r.status),
                        text: String(r.text || '').slice(0, 32)
                    }))
                    .filter(r => r.roomTypes.length > 0);
            }

            if (!next.time.rules.length) next.time.rules = utils.clone(defaultConfig.time.rules);
            if (!next.room.rules.length) next.room.rules = utils.clone(defaultConfig.room.rules);
            
            return next;
        }

        async function loadConfig() {
            const repo = window.configRepository;
            if (!repo?.getString) {
                state.config = utils.clone(defaultConfig);
                return;
            }
            try {
                const text = await repo.getString(CONFIG_KEY, '');
                state.config = text ? mergeConfig(defaultConfig, JSON.parse(text)) : utils.clone(defaultConfig);
            } catch (err) {
                console.error('[AutoStatus] load config failed', err);
                state.config = utils.clone(defaultConfig);
            }
        }

        const saveConfigDebounced = utils.debounce(async () => {
            const repo = window.configRepository;
            if (!repo?.setString) return;
            try {
                await repo.setString(CONFIG_KEY, JSON.stringify(state.config));
            } catch (err) {
                console.error('[AutoStatus] save config failed', err);
            }
        }, 200);

        function parseLocation(tag) {
            const text = String(tag || '');
            const ctx = { accessType: '', groupAccessType: null, worldId: null };
            
            if (!text || text.startsWith('local') || !text.includes(':')) return ctx;
            
            const parts = text.split(':');
            if (parts.length < 2) return ctx;
            
            ctx.worldId = parts[0];
            const instance = parts.slice(1).join(':');
            const chunks = instance.split('~');
            
            let hiddenId, privateId, friendsId, groupId;
            
            for (let i = 1; i < chunks.length; i++) {
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

        function getRoomTypeFromLocation(loc) {
            if (!loc) return null;
            if (loc.accessType === 'group') {
                if (loc.groupAccessType === 'public') return 'Group Public';
                if (loc.groupAccessType === 'plus') return 'Group Plus';
                return 'Group';
            }
            const typeMap = {
                'public': 'Public',
                'friends': 'Friends',
                'friends+': 'Friends+',
                'invite': 'Invite',
                'invite+': 'Invite+'
            };
            return typeMap[loc.accessType] || null;
        }

        function readCurrentRoomType() {
            const userStore = utils.getPiniaStore('User') || window.$pinia?.user || window.$pinia?.User;
            if (!userStore?.currentUser) return null;

            const cachedUser = userStore.cachedUsers?.get?.(userStore.currentUser.id);
            if (cachedUser?.$location && typeof cachedUser.$location === 'object') {
                const loc = cachedUser.$location;
                return {
                    roomType: getRoomTypeFromLocation(loc),
                    worldId: loc.worldId || ''
                };
            }

            const locationTag = userStore.currentUser.$locationTag || userStore.currentUser.presence?.world || '';
            if (!locationTag || ['traveling', 'offline', 'private'].includes(locationTag) || locationTag.startsWith('local')) {
                return null;
            }

            const parsed = parseLocation(locationTag);
            if (!parsed?.accessType) return null;

            return {
                roomType: getRoomTypeFromLocation(parsed),
                worldId: parsed.worldId
            };
        }

        function nowTimeHHMM() {
            const d = new Date();
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }

        function isTimeInRange(now, start, end) {
            return start <= end ? (now >= start && now < end) : (now >= start || now < end);
        }

        function evaluateTimeRule() {
            if (!state.config.time.enabled) return null;
            const now = nowTimeHHMM();
            
            for (const rule of state.config.time.rules) {
                const start = utils.sanitizeTime(rule.start);
                const end = utils.sanitizeTime(rule.end);
                if (!start || !end) continue;
                if (isTimeInRange(now, start, end)) {
                    return {
                        source: 'time',
                        status: utils.normalizeStatus(rule.status),
                        text: String(rule.text || '').slice(0, 32),
                        rule
                    };
                }
            }
            return null;
        }

        function evaluateRoomRule(currentRoomType) {
            if (!state.config.room.enabled || !currentRoomType) return null;
            
            for (const rule of state.config.room.rules) {
                if (!Array.isArray(rule.roomTypes)) continue;
                if (rule.roomTypes.includes(currentRoomType)) {
                    return {
                        source: 'room',
                        status: utils.normalizeStatus(rule.status),
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
            return state.config.priority === 'time' ? timeMatch : roomMatch;
        }

        function getCurrentStatusSnapshot() {
            const userStore = utils.getPiniaStore('User');
            if (!userStore?.currentUser) return { status: '', text: '' };
            return {
                status: utils.normalizeStatus(userStore.currentUser.status),
                text: String(userStore.currentUser.statusDescription || '')
            };
        }

        async function applySocialStatus(payload) {
            const requestApi = window.request?.userRequest;
            if (!requestApi?.saveCurrentUser) return false;
            
            await requestApi.saveCurrentUser({
                status: utils.normalizeStatus(payload.status),
                statusDescription: String(payload.text || '').slice(0, 32)
            });
            return true;
        }

        function debugLog(data) {
            if (!state.config.debug) return;
            console.log('[AutoStatus] evaluate', data);
        }

        async function evaluateAndApply() {
            if (!state.config.enabled) return;

            const roomInfo = readCurrentRoomType();
            const roomType = roomInfo?.roomType;
            const timeMatch = evaluateTimeRule();
            const roomMatch = evaluateRoomRule(roomType);
            const finalRule = pickFinalRule(timeMatch, roomMatch);

            let applied = false;
            if (finalRule) {
                const next = {
                    status: utils.normalizeStatus(finalRule.status),
                    text: String(finalRule.text || '').slice(0, 32)
                };
                const key = `${next.status}:::${next.text}`;
                const curr = getCurrentStatusSnapshot();
                const currentKey = `${curr.status}:::${curr.text}`;

                if (state.lastApplied !== key && currentKey !== key) {
                    try {
                        await applySocialStatus(next);
                        state.lastApplied = key;
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
                roomType
            });
        }

        // ==================== UI ====================
        function ensureStyle() {
            if (document.getElementById('auto-status-style')) return;
            const style = document.createElement('style');
            style.id = 'auto-status-style';
            style.textContent = `
                #auto-status-tool { cursor: pointer; }
                #auto-status-modal-root { position: fixed; inset: 0; z-index: 9999; display: none; }
                #auto-status-modal-root.open { display: block; }
                #auto-status-modal-root .as-overlay { position: absolute; inset: 0; background: color-mix(in srgb, var(--foreground, #000) 25%, transparent); }
                #auto-status-modal-root .as-dialog { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: min(960px, calc(100vw - 24px)); max-height: calc(100vh - 24px); overflow: auto; background: var(--card, #fff); color: var(--foreground, #111); border: 1px solid var(--border, #ddd); border-radius: 12px; box-shadow: 0 10px 32px color-mix(in srgb, var(--foreground, #000) 18%, transparent); padding: 16px; }
                #auto-status-modal-root .as-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
                #auto-status-modal-root .as-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin: 8px 0; }
                #auto-status-modal-root .as-section { border: 1px solid var(--border, #ddd); border-radius: 8px; padding: 10px; margin: 8px 0; background: color-mix(in srgb, var(--card, #fff) 92%, var(--muted, #eee)); }
                #auto-status-modal-root .as-subtitle { font-weight: 600; margin-bottom: 6px; }
                #auto-status-modal-root input, #auto-status-modal-root select, #auto-status-modal-root button { background: var(--background, #fff); color: var(--foreground, #111); border: 1px solid var(--border, #ddd); border-radius: 6px; padding: 6px 8px; font-size: 13px; cursor: pointer; }
                #auto-status-modal-root button:hover { background: color-mix(in srgb, var(--accent, #f2f2f2) 90%, transparent); }
                #auto-status-modal-root .as-pill { border: 1px solid var(--border, #ddd); border-radius: 999px; padding: 4px 8px; display: inline-flex; align-items: center; gap: 6px; }
                #auto-status-modal-root .as-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
                #auto-status-modal-root .as-disabled { opacity: .6; pointer-events: none; }
                #auto-status-modal-root .as-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
                @media (max-width: 800px) { #auto-status-modal-root .as-grid { grid-template-columns: 1fr; } }
            `;
            document.head.appendChild(style);
        }

        function createStatusSelect(value, onChange) {
            const select = document.createElement('select');
            STATUS_OPTIONS.forEach(item => {
                const option = document.createElement('option');
                option.value = item.value;
                option.textContent = item.label;
                if (item.value === value) option.selected = true;
                select.appendChild(option);
            });
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
            start.value = utils.sanitizeTime(rule.start) || '09:00';
            start.addEventListener('change', () => {
                state.config.time.rules[index].start = utils.sanitizeTime(start.value) || '00:00';
                saveConfigDebounced();
            });

            const end = document.createElement('input');
            end.type = 'time';
            end.value = utils.sanitizeTime(rule.end) || '18:00';
            end.addEventListener('change', () => {
                state.config.time.rules[index].end = utils.sanitizeTime(end.value) || '00:00';
                saveConfigDebounced();
            });

            const statusSelect = createStatusSelect(utils.normalizeStatus(rule.status), (value) => {
                state.config.time.rules[index].status = utils.normalizeStatus(value);
                saveConfigDebounced();
            });

            const text = document.createElement('input');
            text.type = 'text';
            text.maxLength = 32;
            text.placeholder = '状态名';
            text.value = String(rule.text || '');
            text.addEventListener('input', () => {
                state.config.time.rules[index].text = String(text.value || '').slice(0, 32);
                saveConfigDebounced();
            });

            const removeBtn = document.createElement('button');
            removeBtn.textContent = '删除';
            removeBtn.addEventListener('click', () => {
                state.config.time.rules.splice(index, 1);
                if (!state.config.time.rules.length) {
                    state.config.time.rules.push({ start: '09:00', end: '18:00', status: 'active', text: 'Working' });
                }
                saveConfigDebounced();
                renderDialogBody(listRoot);
            });

            row.append('时间段', start, '到', end, statusSelect, text, removeBtn);
            return row;
        }

        function createRoomTypesEditor(rule, index) {
            const wrapper = document.createElement('div');
            wrapper.className = 'as-grid';

            ROOM_TYPES.forEach((typeName) => {
                const pill = document.createElement('label');
                pill.className = 'as-pill';

                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.checked = Array.isArray(rule.roomTypes) && rule.roomTypes.includes(typeName);
                cb.addEventListener('change', () => {
                    const target = state.config.room.rules[index];
                    const set = new Set(Array.isArray(target.roomTypes) ? target.roomTypes : []);
                    cb.checked ? set.add(typeName) : set.delete(typeName);
                    target.roomTypes = ROOM_TYPES.filter(x => set.has(x));
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

            const statusSelect = createStatusSelect(utils.normalizeStatus(rule.status), (value) => {
                state.config.room.rules[index].status = utils.normalizeStatus(value);
                saveConfigDebounced();
            });

            const text = document.createElement('input');
            text.type = 'text';
            text.maxLength = 32;
            text.placeholder = '状态名';
            text.value = String(rule.text || '');
            text.addEventListener('input', () => {
                state.config.room.rules[index].text = String(text.value || '').slice(0, 32);
                saveConfigDebounced();
            });

            const removeBtn = document.createElement('button');
            removeBtn.textContent = '删除';
            removeBtn.addEventListener('click', () => {
                state.config.room.rules.splice(index, 1);
                if (!state.config.room.rules.length) {
                    state.config.room.rules.push({ roomTypes: ['Public'], status: 'active', text: '' });
                }
                saveConfigDebounced();
                renderDialogBody(listRoot);
            });

            line.append('状态', statusSelect, text, removeBtn);
            box.append(head, createRoomTypesEditor(rule, index), line);
            return box;
        }

        function renderDialogBody(root) {
            if (!root) return;
            root.innerHTML = '';
            const cfg = state.config;

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
            ['room', 'time'].forEach(val => {
                const opt = document.createElement('option');
                opt.value = val;
                opt.textContent = val === 'room' ? '优先级: 房间 > 时间' : '优先级: 时间 > 房间';
                if (cfg.priority === val) opt.selected = true;
                prioritySel.appendChild(opt);
            });
            prioritySel.addEventListener('change', () => {
                cfg.priority = prioritySel.value;
                saveConfigDebounced();
            });

            top.append(enabledSwitch, enabledLabel, debugSwitch, debugLabel, prioritySel);
            root.appendChild(top);

            const bodyWrapper = document.createElement('div');
            if (!cfg.enabled) bodyWrapper.className = 'as-disabled';

            // 时间规则
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
            if (!cfg.time.enabled) timeRuleList.className = 'as-disabled';
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

            // 房间规则
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
            if (!cfg.room.enabled) roomRuleList.className = 'as-disabled';
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
            if (!state.ui.modalRoot) return;
            renderDialogBody(state.ui.dialogBody);
            state.ui.modalRoot.classList.add('open');
        }

        function closeDialog() {
            if (!state.ui.modalRoot) return;
            state.ui.modalRoot.classList.remove('open');
        }

        function ensureDialog() {
            if (document.getElementById('auto-status-modal-root')) {
                state.ui.modalRoot = document.getElementById('auto-status-modal-root');
                state.ui.dialogBody = document.getElementById('auto-status-dialog-body');
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

            state.ui.modalRoot = root;
            state.ui.dialogBody = body;
        }

        function createToolCard() {
            const card = document.createElement('div');
            card.id = 'auto-status-tool';
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

        function createToolCardOnce() {
            if (state.cardCreated) return;
            if (document.getElementById('auto-status-tool')) {
                state.cardCreated = true;
                return;
            }

            const card = createToolCard();
            document.body.appendChild(card);
            state.cardCreated = true;
            console.log('[AutoStatus] Card created once');
        }

        function ensureUi() {
            ensureStyle();
            ensureDialog();
            createToolCardOnce();
        }

        function startLoop() {
            if (state.intervalId) clearInterval(state.intervalId);
            state.intervalId = setInterval(() => {
                evaluateAndApply().catch(err => console.error('[AutoStatus] evaluate failed', err));
            }, 5000);
        }

        async function init() {
            if (state.initialized) return;
            state.initialized = true;

            await loadConfig();
            ensureUi();
            startLoop();
            console.log('[AutoStatus] initialized');
        }

        function destroy() {
            if (state.intervalId) {
                clearInterval(state.intervalId);
                state.intervalId = null;
            }
            if (state.saveTimer) {
                clearTimeout(state.saveTimer);
                state.saveTimer = null;
            }
            document.getElementById('auto-status-style')?.remove();
            document.getElementById('auto-status-modal-root')?.remove();
            document.getElementById('auto-status-tool')?.remove();
            state.cardCreated = false;
            state.initialized = false;
        }

        return { init, destroy, openDialog };
    })();

    // ==================== 模块2: Avatar Auto Switch ====================
    const AvatarSwitchModule = (() => {
        const STORAGE_KEY = 'vrcx_custom_switch_avatar_map';
        const CHECK_INTERVAL_MS = 2000;
        const MIN_RETRY_MS = 10000;
        const AVATAR_ID_REGEX = /avtr_[0-9A-Fa-f]{8}-([0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}/;

        const LOCATION_TYPES = [
            { key: 'public', label: 'Public' },
            { key: 'friends', label: 'Friends' },
            { key: 'friends+', label: 'Friends+' },
            { key: 'invite', label: 'Invite' },
            { key: 'invite+', label: 'Invite+' },
            { key: 'groupPublic', label: 'Group Public' },
            { key: 'groupPlus', label: 'Group Plus' },
            { key: 'group', label: 'Group' }
        ];

        const state = {
            lastLocationTag: '',
            lastAttemptAt: 0,
            warnedInvalidId: false,
            locationChangedAt: 0,
            seenLocationTag: '',
            intervalId: null,
            initialized: false,
            ui: {},
            debug: true,
            currentAttempt: null,
            cardCreated: false
        };

        function getSettings() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (!raw) return getDefaultSettings();
                const parsed = JSON.parse(raw);
                return {
                    enabled: parsed?.enabled !== false,
                    mapA: {
                        avatarId: String(parsed?.mapA?.avatarId || ''),
                        manualId: String(parsed?.mapA?.manualId || ''),
                        types: Array.isArray(parsed?.mapA?.types) ? parsed.mapA.types : []
                    },
                    mapB: {
                        avatarId: String(parsed?.mapB?.avatarId || ''),
                        manualId: String(parsed?.mapB?.manualId || ''),
                        types: Array.isArray(parsed?.mapB?.types) ? parsed.mapB.types : []
                    }
                };
            } catch (err) {
                console.warn('[AvatarSwitch] Failed to parse settings:', err);
                return getDefaultSettings();
            }
        }

        function getDefaultSettings() {
            return {
                enabled: true,
                mapA: { avatarId: '', manualId: '', types: [] },
                mapB: { avatarId: '', manualId: '', types: [] }
            };
        }

        function setSettings(settings) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        }

        function getStores() {
            if (!window.$pinia) return null;
            return {
                user: window.$pinia.user,
                avatar: window.$pinia.avatar,
                appearanceSettings: window.$pinia.appearanceSettings,
                game: window.$pinia.game,
                instance: window.$pinia.instance
            };
        }

        function parseLocationTag(tag) {
            const info = { 
                accessType: '', 
                groupAccessType: '', 
                accessTypeName: '', 
                canRequestInvite: false,
                worldId: '',
                instanceId: ''
            };
            const value = String(tag || '');
            
            if (['offline', 'offline:offline', 'private', 'private:private', 'traveling', 'traveling:traveling'].includes(value) || value.startsWith('local')) {
                return info;
            }
            
            const sep = value.indexOf(':');
            if (sep < 0) return info;
            
            info.worldId = value.slice(0, sep);
            info.accessType = 'public';
            const instanceId = value.slice(sep + 1);
            info.instanceId = instanceId;
            const parts = instanceId.split('~');
            
            for (let i = 1; i < parts.length; i++) {
                const part = parts[i];
                const open = part.indexOf('(');
                const close = part.lastIndexOf(')');
                const key = open >= 0 ? part.slice(0, open) : part;
                const val = open >= 0 && close > open ? part.slice(open + 1, close) : '';
                
                if (key === 'private') info.accessType = 'invite';
                else if (key === 'hidden') info.accessType = 'friends+';
                else if (key === 'friends') info.accessType = 'friends';
                else if (key === 'canRequestInvite') info.canRequestInvite = true;
                else if (key === 'group') info.accessType = 'group';
                else if (key === 'groupAccessType') info.groupAccessType = val;
            }
            
            if (info.accessType === 'invite' && info.canRequestInvite) info.accessType = 'invite+';
            if (info.accessType === 'group') {
                if (info.groupAccessType === 'public') info.accessTypeName = 'groupPublic';
                else if (info.groupAccessType === 'plus') info.accessTypeName = 'groupPlus';
                else info.accessTypeName = 'group';
            } else {
                info.accessTypeName = info.accessType;
            }
            
            return info;
        }

        function getLocationType(locationInfo) {
            if (!locationInfo) return '';
            if (locationInfo.accessTypeName) return locationInfo.accessTypeName;
            if (locationInfo.accessType === 'group') {
                if (locationInfo.groupAccessType === 'public') return 'groupPublic';
                if (locationInfo.groupAccessType === 'plus') return 'groupPlus';
                return 'group';
            }
            if (locationInfo.accessType === 'invite' && locationInfo.canRequestInvite) return 'invite+';
            return locationInfo.accessType || '';
        }

        function getCurrentLocationInfo(userStore) {
            const currentUser = userStore?.currentUser;
            const cachedUser = userStore?.cachedUsers?.get?.(currentUser?.id);
            if (cachedUser?.$location && typeof cachedUser.$location === 'object') {
                const loc = cachedUser.$location;
                return {
                    accessType: loc.accessType || '',
                    groupAccessType: loc.groupAccessType || '',
                    accessTypeName: loc.accessTypeName || '',
                    canRequestInvite: loc.canRequestInvite || false,
                    worldId: loc.worldId || '',
                    isTraveling: false
                };
            }
            const locationTag = currentUser?.$locationTag || currentUser?.presence?.world || '';
            return parseLocationTag(locationTag);
        }

        function isTraveling(locationInfo, userStore) {
            if (locationInfo?.isTraveling) return true;
            const locationTag = userStore?.currentUser?.$locationTag || '';
            return locationTag === 'traveling' || locationTag === 'traveling:traveling';
        }

        function getTargetAvatarId(locationType, settings) {
            if (state.debug) console.log('[AvatarSwitch] Checking location type:', locationType);
            
            const checkMap = (map, mapName) => {
                const manualId = map?.manualId?.trim?.() || '';
                const avatarId = map?.avatarId || '';
                const types = map?.types || [];
                
                if (state.debug) console.log(`[AvatarSwitch] ${mapName} check:`, { manualId: !!manualId, avatarId: !!avatarId, types });
                
                if (manualId && AVATAR_ID_REGEX.test(manualId)) {
                    if (types.includes(locationType)) {
                        if (state.debug) console.log(`[AvatarSwitch] ${mapName} matched with manualId:`, manualId);
                        return manualId;
                    }
                }
                
                if (avatarId && AVATAR_ID_REGEX.test(avatarId)) {
                    if (types.includes(locationType)) {
                        if (state.debug) console.log(`[AvatarSwitch] ${mapName} matched with avatarId:`, avatarId);
                        return avatarId;
                    }
                }
                
                return null;
            };

            return checkMap(settings?.mapA, 'mapA') || checkMap(settings?.mapB, 'mapB') || '';
        }

        function shouldAttempt(locationTag, currentAvatarId, targetAvatarId) {
            if (state.currentAttempt && state.currentAttempt.targetId === targetAvatarId) {
                const timeSinceAttempt = Date.now() - state.currentAttempt.time;
                if (timeSinceAttempt < MIN_RETRY_MS) {
                    if (state.debug) console.log('[AvatarSwitch] Skip: already attempting to switch to this avatar');
                    return false;
                }
            }
            
            if (state.lastLocationTag === locationTag) {
                if (currentAvatarId === targetAvatarId) {
                    if (state.debug) console.log('[AvatarSwitch] Skip: already on target avatar');
                    return false;
                }
                const timeSinceLastAttempt = Date.now() - state.lastAttemptAt;
                if (timeSinceLastAttempt < MIN_RETRY_MS) {
                    if (state.debug) console.log('[AvatarSwitch] Skip: throttled, wait', Math.ceil((MIN_RETRY_MS - timeSinceLastAttempt)/1000), 'seconds');
                    return false;
                }
            }
            
            return true;
        }

        async function selectAvatarDirect(avatarId, userStore) {
            if (!window.webApiService || !window.$debug?.endpointDomain) {
                console.warn('[AvatarSwitch] webApiService or endpoint missing.');
                return false;
            }
            
            const url = `${window.$debug.endpointDomain}/avatars/${avatarId}/select`;
            console.log('[AvatarSwitch] Selecting avatar via API:', url);
            
            try {
                const response = await window.webApiService.execute({
                    url, 
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json;charset=utf-8' },
                    body: '{}'
                });
                
                console.log('[AvatarSwitch] API response:', response);
                
                if (response?.status === 200 && response?.data) {
                    try {
                        const json = JSON.parse(response.data);
                        console.log('[AvatarSwitch] Response JSON:', json);
                        if (userStore?.applyCurrentUser) {
                            userStore.applyCurrentUser(json);
                        }
                        return true;
                    } catch (err) {
                        console.warn('[AvatarSwitch] Failed to parse response:', err);
                        return false;
                    }
                }
                return false;
            } catch (err) {
                console.warn('[AvatarSwitch] Avatar select failed:', err);
                return false;
            }
        }

        function tick() {
            const stores = getStores();
            if (!stores?.user?.currentUser?.id) {
                if (state.debug) console.log('[AvatarSwitch] No current user');
                return;
            }
            
            const currentUser = stores.user.currentUser;
            const locationTag = currentUser.$locationTag || '';
            const currentAvatarId = currentUser.currentAvatar || '';
            
            if (locationTag !== state.seenLocationTag) {
                state.seenLocationTag = locationTag;
                state.locationChangedAt = Date.now();
                state.currentAttempt = null;
                console.log('[AvatarSwitch] Location changed to:', locationTag);
            }
            
            const locationInfo = getCurrentLocationInfo(stores.user);
            const locationType = getLocationType(locationInfo);
            
            if (state.debug) {
                console.log('[AvatarSwitch] Tick:', {
                    currentAvatarId,
                    locationTag,
                    locationType,
                    isTraveling: isTraveling(locationInfo, stores)
                });
            }
            
            if (isTraveling(locationInfo, stores)) {
                if (state.debug) console.log('[AvatarSwitch] Traveling, skip');
                return;
            }
            
            if (!stores.game?.isGameRunning) {
                if (state.debug) console.log('[AvatarSwitch] Game not running, skip');
                return;
            }
            
            const instanceWorld = utils.readRef(stores.instance?.currentInstanceWorld);
            if (!instanceWorld?.ref?.id) {
                if (state.debug) console.log('[AvatarSwitch] Instance world not ready, skip');
                return;
            }
            
            const usersData = utils.readRef(stores.instance?.currentInstanceUsersData);
            if (!Array.isArray(usersData) || usersData.length === 0) {
                if (state.debug) console.log('[AvatarSwitch] Player list empty, skip');
                return;
            }
            
            if (!locationType || !LOCATION_TYPES.some(t => t.key === locationType)) {
                if (state.debug) console.log('[AvatarSwitch] Invalid location type:', locationType);
                state.lastLocationTag = locationTag;
                return;
            }
            
            if (Date.now() - state.locationChangedAt < 2000) {
                if (state.debug) console.log('[AvatarSwitch] Waiting for location stabilize');
                return;
            }

            const settings = getSettings();
            if (settings.enabled === false) {
                if (state.debug) console.log('[AvatarSwitch] Disabled');
                return;
            }
            
            const targetAvatarId = getTargetAvatarId(locationType, settings);
            
            if (!targetAvatarId) {
                if (!state.warnedInvalidId) {
                    console.warn('[AvatarSwitch] No valid avatar mapping for:', locationType);
                    state.warnedInvalidId = true;
                }
                return;
            }
            state.warnedInvalidId = false;

            if (currentAvatarId === targetAvatarId) {
                state.lastLocationTag = locationTag;
                state.currentAttempt = null;
                if (state.debug) console.log('[AvatarSwitch] Already on target avatar');
                return;
            }

            if (!shouldAttempt(locationTag, currentAvatarId, targetAvatarId)) {
                return;
            }

            console.log('[AvatarSwitch] Switching avatar:', currentAvatarId, '->', targetAvatarId);
            
            state.lastLocationTag = locationTag;
            state.lastAttemptAt = Date.now();
            state.currentAttempt = {
                targetId: targetAvatarId,
                time: Date.now()
            };
            
            selectAvatarDirect(targetAvatarId, stores.user).then(success => {
                if (success) {
                    console.log('[AvatarSwitch] Avatar switch request sent successfully');
                } else {
                    console.warn('[AvatarSwitch] Avatar switch failed');
                }
            });
        }

        function startLoop() {
            if (state.intervalId) clearInterval(state.intervalId);
            state.intervalId = setInterval(tick, CHECK_INTERVAL_MS);
            console.log('[AvatarSwitch] Loop started, interval:', CHECK_INTERVAL_MS, 'ms');
        }

        // ==================== UI Functions ====================
        function ensureStyle() {
            if (document.getElementById('avatar-switch-style')) return;
            const style = document.createElement('style');
            style.id = 'avatar-switch-style';
            style.textContent = `
                #avatar-switch-tool { cursor: pointer; }
                #avatar-switch-modal-root { position: fixed; inset: 0; z-index: 9999; display: none; }
                #avatar-switch-modal-root.open { display: block; }
                #avatar-switch-modal-root .avs-overlay { position: absolute; inset: 0; background: color-mix(in srgb, var(--foreground, #000) 25%, transparent); }
                #avatar-switch-modal-root .avs-dialog { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: min(600px, calc(100vw - 24px)); max-height: calc(100vh - 24px); overflow: auto; background: var(--card, #fff); color: var(--foreground, #111); border: 1px solid var(--border, #ddd); border-radius: 12px; box-shadow: 0 10px 32px color-mix(in srgb, var(--foreground, #000) 18%, transparent); padding: 16px; }
                #avatar-switch-modal-root .avs-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
                #avatar-switch-modal-root .avs-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin: 8px 0; }
                #avatar-switch-modal-root .avs-section { border: 1px solid var(--border, #ddd); border-radius: 8px; padding: 12px; margin: 8px 0; background: color-mix(in srgb, var(--card, #fff) 92%, var(--muted, #eee)); }
                #avatar-switch-modal-root .avs-subtitle { font-weight: 600; margin-bottom: 8px; color: var(--foreground, #111); }
                #avatar-switch-modal-root input, #avatar-switch-modal-root select, #avatar-switch-modal-root button { background: var(--background, #fff); color: var(--foreground, #111); border: 1px solid var(--border, #ddd); border-radius: 6px; padding: 6px 8px; font-size: 13px; }
                #avatar-switch-modal-root button { cursor: pointer; }
                #avatar-switch-modal-root button:hover { background: color-mix(in srgb, var(--accent, #f2f2f2) 90%, transparent); }
                #avatar-switch-modal-root .avs-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
                #avatar-switch-modal-root .avs-pill { border: 1px solid var(--border, #ddd); border-radius: 999px; padding: 4px 8px; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; }
                #avatar-switch-modal-root .avs-pill input[type="checkbox"] { margin: 0; }
                #avatar-switch-modal-root .avs-disabled { opacity: .6; pointer-events: none; }
                #avatar-switch-modal-root .avs-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
                #avatar-switch-modal-root .avs-status { font-size: 12px; color: var(--muted-foreground, #666); margin-bottom: 8px; }
                #avatar-switch-modal-root .avs-input-full { width: 100%; box-sizing: border-box; margin-bottom: 8px; }
                @media (max-width: 600px) { #avatar-switch-modal-root .avs-grid { grid-template-columns: 1fr; } }
            `;
            document.head.appendChild(style);
        }

        function createSwitch(checked, onChange) {
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = Boolean(checked);
            input.addEventListener('change', () => onChange(input.checked));
            return input;
        }

        function createSelect(options, value, onChange) {
            const select = document.createElement('select');
            select.className = 'avs-input-full';
            const empty = document.createElement('option');
            empty.value = '';
            empty.textContent = 'None';
            select.appendChild(empty);
            
            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.id;
                option.textContent = opt.name || opt.id;
                select.appendChild(option);
            });
            
            select.value = value || '';
            select.addEventListener('change', () => onChange(select.value));
            return select;
        }

        function createTextInput(placeholder, value, onChange) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = placeholder;
            input.className = 'avs-input-full';
            input.value = value || '';
            input.addEventListener('input', () => onChange(input.value));
            return input;
        }

        function createTypeChecklist(selectedTypes, onChange) {
            const wrapper = document.createElement('div');
            wrapper.className = 'avs-grid';
            
            LOCATION_TYPES.forEach(type => {
                const pill = document.createElement('label');
                pill.className = 'avs-pill';
                
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.value = type.key;
                cb.checked = selectedTypes.includes(type.key);
                cb.addEventListener('change', () => {
                    const checked = Array.from(wrapper.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
                    onChange(checked);
                });
                
                const span = document.createElement('span');
                span.textContent = type.label;
                pill.append(cb, span);
                wrapper.appendChild(pill);
            });
            
            return wrapper;
        }

        function getAvatarList() {
            const stores = getStores();
            const list = stores?.user?.userDialog?.avatars || [];
            const avatars = Array.from(list);
            avatars.sort((a, b) => String(a.name || a.id).localeCompare(String(b.name || b.id)));
            return avatars;
        }

        function loadAvatars() {
            const stores = getStores();
            if (!stores?.user?.currentUser?.id) return;
            stores.user.userDialog.id = stores.user.currentUser.id;
            stores.user.refreshUserDialogAvatars();
        }

        function renderDialogBody(root) {
            if (!root) return;
            root.innerHTML = '';
            
            const settings = getSettings();
            
            const top = document.createElement('div');
            top.className = 'avs-row';
            
            const enabledSwitch = createSwitch(settings.enabled, (value) => {
                const newSettings = getSettings();
                newSettings.enabled = value;
                setSettings(newSettings);
                renderDialogBody(root);
            });
            
            const enabledLabel = document.createElement('span');
            enabledLabel.textContent = '启用自动切换 Avatar';
            
            top.append(enabledSwitch, enabledLabel);
            root.appendChild(top);
            
            const bodyWrapper = document.createElement('div');
            if (!settings.enabled) bodyWrapper.className = 'avs-disabled';
            
            const loadSection = document.createElement('div');
            loadSection.className = 'avs-row';
            
            const loadBtn = document.createElement('button');
            loadBtn.textContent = '加载我的 Avatar 列表';
            loadBtn.addEventListener('click', () => {
                loadAvatars();
                setTimeout(() => renderDialogBody(root), 1500);
            });
            
            const statusText = document.createElement('span');
            statusText.className = 'avs-status';
            const avatarCount = getAvatarList().length;
            statusText.textContent = avatarCount > 0 ? `已加载 ${avatarCount} 个 Avatar` : 'Avatar 列表未加载';
            
            loadSection.append(loadBtn, statusText);
            bodyWrapper.appendChild(loadSection);
            
            const sectionA = document.createElement('div');
            sectionA.className = 'avs-section';
            
            const titleA = document.createElement('div');
            titleA.className = 'avs-subtitle';
            titleA.textContent = '规则 A';
            
            const selectA = createSelect(getAvatarList(), settings.mapA.avatarId, (value) => {
                const newSettings = getSettings();
                newSettings.mapA.avatarId = value;
                setSettings(newSettings);
            });
            
            const manualA = createTextInput('手动输入 Avatar ID (可选)', settings.mapA.manualId, (value) => {
                const newSettings = getSettings();
                newSettings.mapA.manualId = value;
                setSettings(newSettings);
            });
            
            const typesA = createTypeChecklist(settings.mapA.types, (checked) => {
                const newSettings = getSettings();
                newSettings.mapA.types = checked;
                setSettings(newSettings);
            });
            
            sectionA.append(titleA, selectA, manualA, typesA);
            bodyWrapper.appendChild(sectionA);
            
            const sectionB = document.createElement('div');
            sectionB.className = 'avs-section';
            
            const titleB = document.createElement('div');
            titleB.className = 'avs-subtitle';
            titleB.textContent = '规则 B';
            
            const selectB = createSelect(getAvatarList(), settings.mapB.avatarId, (value) => {
                const newSettings = getSettings();
                newSettings.mapB.avatarId = value;
                setSettings(newSettings);
            });
            
            const manualB = createTextInput('手动输入 Avatar ID (可选)', settings.mapB.manualId, (value) => {
                const newSettings = getSettings();
                newSettings.mapB.manualId = value;
                setSettings(newSettings);
            });
            
            const typesB = createTypeChecklist(settings.mapB.types, (checked) => {
                const newSettings = getSettings();
                newSettings.mapB.types = checked;
                newSettings.mapB.types = checked.filter(t => !newSettings.mapA.types.includes(t));
                setSettings(newSettings);
                renderDialogBody(root);
            });
            
            sectionB.append(titleB, selectB, manualB, typesB);
            bodyWrapper.appendChild(sectionB);
            
            root.appendChild(bodyWrapper);
        }

        function openDialog() {
            if (!state.ui.modalRoot) return;
            if (!getAvatarList().length) {
                loadAvatars();
            }
            renderDialogBody(state.ui.dialogBody);
            state.ui.modalRoot.classList.add('open');
        }

        function closeDialog() {
            if (!state.ui.modalRoot) return;
            state.ui.modalRoot.classList.remove('open');
        }

        function ensureDialog() {
            if (document.getElementById('avatar-switch-modal-root')) {
                state.ui.modalRoot = document.getElementById('avatar-switch-modal-root');
                state.ui.dialogBody = document.getElementById('avatar-switch-dialog-body');
                return;
            }

            const root = document.createElement('div');
            root.id = 'avatar-switch-modal-root';

            const overlay = document.createElement('div');
            overlay.className = 'avs-overlay';
            overlay.addEventListener('click', closeDialog);

            const dialog = document.createElement('div');
            dialog.className = 'avs-dialog';

            const title = document.createElement('div');
            title.className = 'avs-title';
            title.textContent = 'Auto Avatar Switch';

            const body = document.createElement('div');
            body.id = 'avatar-switch-dialog-body';

            const footer = document.createElement('div');
            footer.className = 'avs-footer';

            const closeBtn = document.createElement('button');
            closeBtn.textContent = '关闭';
            closeBtn.addEventListener('click', closeDialog);

            footer.appendChild(closeBtn);
            dialog.append(title, body, footer);
            root.append(overlay, dialog);
            document.body.appendChild(root);

            state.ui.modalRoot = root;
            state.ui.dialogBody = body;
        }

        function createToolCard() {
            const card = document.createElement('div');
            card.id = 'avatar-switch-tool';
            card.setAttribute('data-v-823ccd7a', '');
            card.className = 'bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm tool-card p-0 gap-0';
            card.innerHTML = `
                <div data-v-823ccd7a class="tool-content">
                    <div data-v-823ccd7a class="tool-icon text-2xl">👤</div>
                    <div data-v-823ccd7a class="tool-info">
                        <div data-v-823ccd7a class="tool-name">Auto Avatar Switch</div>
                        <div data-v-823ccd7a class="tool-description">根据房间类型自动切换 Avatar</div>
                    </div>
                </div>`;
            card.addEventListener('click', openDialog);
            return card;
        }

        function createToolCardOnce() {
            if (state.cardCreated) return;
            if (document.getElementById('avatar-switch-tool')) {
                state.cardCreated = true;
                return;
            }

            const card = createToolCard();
            document.body.appendChild(card);
            state.cardCreated = true;
            console.log('[AvatarSwitch] Card created once');
        }

        function ensureUi() {
            ensureStyle();
            ensureDialog();
            createToolCardOnce();
        }

        function init() {
            if (state.initialized) return;
            state.initialized = true;
            
            ensureUi();
            startLoop();
            console.log('[AvatarSwitch] initialized');
        }

        function destroy() {
            if (state.intervalId) {
                clearInterval(state.intervalId);
                state.intervalId = null;
            }
            document.getElementById('avatar-switch-style')?.remove();
            document.getElementById('avatar-switch-modal-root')?.remove();
            document.getElementById('avatar-switch-tool')?.remove();
            state.cardCreated = false;
            state.initialized = false;
        }

        return { init, destroy, openDialog };
    })();

    // ==================== 启动管理器 ====================
    const AppManager = {
        async init() {
            const waitForDeps = () => {
                return new Promise(resolve => {
                    const check = () => {
                        if (window.$pinia && window.configRepository && document.body) {
                            resolve();
                        } else {
                            setTimeout(check, 500);
                        }
                    };
                    check();
                });
            };

            await waitForDeps();
            
            // 1. 先启动 ExtensionJSManager
            ExtensionJSManager.init();
            
            // 2. 初始化各个模块（只创建卡片，ExtensionJSManager 会负责移动）
            try {
                await AutoStatusModule.init();
            } catch (err) {
                console.error('[AppManager] AutoStatus init failed:', err);
            }
            
            try {
                AvatarSwitchModule.init();
            } catch (err) {
                console.error('[AppManager] AvatarSwitch init failed:', err);
            }

            // 3. 暴露全局接口
            window[GLOBAL_KEYS.autoStatus] = {
                destroy: () => {
                    AutoStatusModule.destroy();
                    AvatarSwitchModule.destroy();
                    ExtensionJSManager.destroy();
                }
            };
        }
    };

    AppManager.init();
})();