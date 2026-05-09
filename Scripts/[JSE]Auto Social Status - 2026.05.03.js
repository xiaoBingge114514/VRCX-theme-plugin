/* %AppData%/VRCX/custom.js */
/* 使用脚本后果自负！ */

(() => {
    'use strict';

    // ==================== 全局命名空间管理 ====================
    const GLOBAL_KEYS = {
        autoStatus: '__VRCX_AUTO_STATUS_CUSTOM__'
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
            category.className = 'mb-6';
            category.setAttribute('data-category', 'extension-js');
            
            category.innerHTML = `
                <div class="cursor-pointer flex items-center p-2 px-3 rounded-lg mb-3 transition-all duration-200 ease-in-out">
                    <i class="ri-code-box-line mr-2 text-sm"></i>
                    <span class="ml-1.5 text-base font-semibold">扩展JS</span>
                </div>
                <div class="grid grid-cols-2 gap-4 ml-4"></div>
            `;

            const header = category.querySelector('.cursor-pointer');
            const grid = category.querySelector('.grid');
            
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                state.userInteracted = true;
                state.isCollapsed = grid.style.display !== 'none';
                
                if (state.isCollapsed) {
                    grid.style.display = 'none';
                    header.classList.add('collapsed');
                } else {
                    grid.style.display = 'grid';
                    header.classList.remove('collapsed');
                }
            });

            return category;
        }

        function moveCardsToCategory(targetCategory) {
            const grid = targetCategory.querySelector('.grid');
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

        function insertAtTop(container, newCategory) {
            if (!container) return false;

            const firstElement = container.firstElementChild;
            if (firstElement) {
                container.insertBefore(newCategory, firstElement);
            } else {
                container.appendChild(newCategory);
            }
            
            return true;
        }

        function applyCollapsedState(category) {
            if (!state.userInteracted) return;

            const grid = category.querySelector('.grid');
            const header = category.querySelector('.cursor-pointer');
            
            if (!grid || !header) return;

            if (state.isCollapsed) {
                grid.style.display = 'none';
                header.classList.add('collapsed');
            } else {
                grid.style.display = 'grid';
                header.classList.remove('collapsed');
            }
        }

        function ensureExtensionCategory() {
            if (state.isProcessing) return;
            state.isProcessing = true;

            try {
                const onTools = String(location.hash || '').includes('/tools');
                if (!onTools) return;

                const container = document.querySelector('.mt-5.px-5');
                if (!container) return;

                let category = document.querySelector('[data-category="extension-js"]');
                let isNewCategory = false;
                
                if (!category) {
                    category = createExtensionCategory();
                    if (!category) return;
                    
                    if (!insertAtTop(container, category)) {
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

    // ==================== 模块: Auto Social Status ====================
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
            card.className = 'group/item flex items-center border text-sm rounded-md transition-colors [a]:hover:bg-accent/50 [a]:transition-colors duration-100 flex-wrap outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] border-border p-4 gap-4 group cursor-pointer hover:bg-accent/50';
            card.innerHTML = `
                <div class="flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none group-has-[[data-slot=item-description]]/item:translate-y-0.5 size-8 rounded-sm [&_svg:not([class*='size-'])]:size-4 bg-transparent border-0">
                    <i class="ri-global-line inline-flex items-center justify-center text-2xl"></i>
                </div>
                <div class="flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none">
                    <div class="flex items-start gap-2">
                        <div class="flex w-fit items-center gap-2 text-sm leading-snug font-medium flex-1">Auto Social Status</div>
                    </div>
                    <p class="text-muted-foreground line-clamp-2 text-sm leading-normal font-normal text-balance">每 5 秒根据时间/房间自动改状态</p>
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
            
            // 2. 初始化 Auto Status 模块
            try {
                await AutoStatusModule.init();
            } catch (err) {
                console.error('[AppManager] AutoStatus init failed:', err);
            }

            // 3. 暴露全局接口
            window[GLOBAL_KEYS.autoStatus] = {
                destroy: () => {
                    AutoStatusModule.destroy();
                    ExtensionJSManager.destroy();
                }
            };
        }
    };

    AppManager.init();
})();
/* %AppData%/VRCX/custom.js */
/* 使用脚本后果自负！ */

(() => {
    'use strict';

    // ==================== 全局命名空间管理 ====================
    const GLOBAL_KEYS = {
        autoStatus: '__VRCX_AUTO_STATUS_CUSTOM__'
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
            category.className = 'mb-6';
            category.setAttribute('data-category', 'extension-js');
            
            category.innerHTML = `
                <div class="cursor-pointer flex items-center p-2 px-3 rounded-lg mb-3 transition-all duration-200 ease-in-out">
                    <i class="ri-code-box-line mr-2 text-sm"></i>
                    <span class="ml-1.5 text-base font-semibold">扩展JS</span>
                </div>
                <div class="grid grid-cols-2 gap-4 ml-4"></div>
            `;

            const header = category.querySelector('.cursor-pointer');
            const grid = category.querySelector('.grid');
            
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                state.userInteracted = true;
                state.isCollapsed = grid.style.display !== 'none';
                
                if (state.isCollapsed) {
                    grid.style.display = 'none';
                    header.classList.add('collapsed');
                } else {
                    grid.style.display = 'grid';
                    header.classList.remove('collapsed');
                }
            });

            return category;
        }

        function moveCardsToCategory(targetCategory) {
            const grid = targetCategory.querySelector('.grid');
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

        function insertAtTop(container, newCategory) {
            if (!container) return false;

            const firstElement = container.firstElementChild;
            if (firstElement) {
                container.insertBefore(newCategory, firstElement);
            } else {
                container.appendChild(newCategory);
            }
            
            return true;
        }

        function applyCollapsedState(category) {
            if (!state.userInteracted) return;

            const grid = category.querySelector('.grid');
            const header = category.querySelector('.cursor-pointer');
            
            if (!grid || !header) return;

            if (state.isCollapsed) {
                grid.style.display = 'none';
                header.classList.add('collapsed');
            } else {
                grid.style.display = 'grid';
                header.classList.remove('collapsed');
            }
        }

        function ensureExtensionCategory() {
            if (state.isProcessing) return;
            state.isProcessing = true;

            try {
                const onTools = String(location.hash || '').includes('/tools');
                if (!onTools) return;

                const container = document.querySelector('.mt-5.px-5');
                if (!container) return;

                let category = document.querySelector('[data-category="extension-js"]');
                let isNewCategory = false;
                
                if (!category) {
                    category = createExtensionCategory();
                    if (!category) return;
                    
                    if (!insertAtTop(container, category)) {
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

    // ==================== 模块: Auto Social Status ====================
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
            card.className = 'group/item flex items-center border text-sm rounded-md transition-colors [a]:hover:bg-accent/50 [a]:transition-colors duration-100 flex-wrap outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] border-border p-4 gap-4 group cursor-pointer hover:bg-accent/50';
            card.innerHTML = `
                <div class="flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none group-has-[[data-slot=item-description]]/item:translate-y-0.5 size-8 rounded-sm [&_svg:not([class*='size-'])]:size-4 bg-transparent border-0">
                    <i class="ri-global-line inline-flex items-center justify-center text-2xl"></i>
                </div>
                <div class="flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none">
                    <div class="flex items-start gap-2">
                        <div class="flex w-fit items-center gap-2 text-sm leading-snug font-medium flex-1">Auto Social Status</div>
                    </div>
                    <p class="text-muted-foreground line-clamp-2 text-sm leading-normal font-normal text-balance">每 5 秒根据时间/房间自动改状态</p>
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
            
            // 2. 初始化 Auto Status 模块
            try {
                await AutoStatusModule.init();
            } catch (err) {
                console.error('[AppManager] AutoStatus init failed:', err);
            }

            // 3. 暴露全局接口
            window[GLOBAL_KEYS.autoStatus] = {
                destroy: () => {
                    AutoStatusModule.destroy();
                    ExtensionJSManager.destroy();
                }
            };
        }
    };

    AppManager.init();
})();
