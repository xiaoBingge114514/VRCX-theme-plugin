/* %AppData%/VRCX/custom.js */
/* 使用脚本后果自负！ */

(() => {
    'use strict';

    // ==================== 全局命名空间管理 ====================
    const GLOBAL_KEYS = {
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

    // ==================== 模块: Avatar Auto Switch ====================
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
                if (info.groupAccessType === 'public') return 'groupPublic';
                if (info.groupAccessType === 'plus') return 'groupPlus';
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

        // --- 修复的函数 ---
        function getAvatarList() {
            const pinia = window.$pinia;
            if (!pinia) return [];

            let myUserId = null;

            // --- 核心修复：绕过 currentUser，直接从 User Store 缓存中获取 ID ---
            const userStore = pinia.user;
            if (userStore && userStore.cachedUsers) {
                const usersMap = userStore.cachedUsers;
                // 通常当前登录用户会在 cachedUsers 的第一个位置
                if (usersMap instanceof Map) {
                    const firstUser = usersMap.values().next().value;
                    if (firstUser && firstUser.id) {
                        myUserId = firstUser.id;
                    }
                }
            }

            // 如果上面没找到，尝试备用方案（读取 Ref）
            if (!myUserId) {
                const currentUserRef = pinia.avatar?.currentUser;
                const currentUser = currentUserRef?.value || currentUserRef;
                myUserId = currentUser?.id;
            }

            if (!myUserId) return []; // 实在找不到 ID 则返回空

            // --- 获取 Avatar 数据 ---
            const avatarStore = pinia.avatar;
            if (!avatarStore || !avatarStore.cachedAvatars) return [];

            const cache = avatarStore.cachedAvatars;
            let allAvatars = [];
            
            // 兼容 Map 和 Object 结构
            if (cache instanceof Map) {
                allAvatars = Array.from(cache.values());
            } else if (typeof cache === 'object') {
                allAvatars = Object.values(cache);
            }

            // --- 核心过滤：只保留自己上传的模型 ---
            const myAvatars = allAvatars.filter(avatar => {
                return avatar && avatar.authorId === myUserId;
            });

            // --- 排序并返回 ---
            myAvatars.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
            return myAvatars;
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
            card.className = 'group/item flex items-center border text-sm rounded-md transition-colors [a]:hover:bg-accent/50 [a]:transition-colors duration-100 flex-wrap outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] border-border p-4 gap-4 group cursor-pointer hover:bg-accent/50';
            card.innerHTML = `
                <div class="flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none group-has-[[data-slot=item-description]]/item:translate-y-0.5 size-8 rounded-sm [&_svg:not([class*='size-'])]:size-4 bg-transparent border-0">
                    <i class="ri-user-line inline-flex items-center justify-center text-2xl"></i>
                </div>
                <div class="flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none">
                    <div class="flex items-start gap-2">
                        <div class="flex w-fit items-center gap-2 text-sm leading-snug font-medium flex-1">Auto Avatar Switch</div>
                    </div>
                    <p class="text-muted-foreground line-clamp-2 text-sm leading-normal font-normal text-balance">根据房间类型自动切换 Avatar</p>
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

        function startLoop() {
            if (state.intervalId) clearInterval(state.intervalId);
            state.intervalId = setInterval(tick, CHECK_INTERVAL_MS);
            console.log('[AvatarSwitch] Loop started, interval:', CHECK_INTERVAL_MS, 'ms');
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
                        if (window.$pinia && document.body) {
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
            
            // 2. 初始化 Avatar Switch 模块
            try {
                AvatarSwitchModule.init();
            } catch (err) {
                console.error('[AppManager] AvatarSwitch init failed:', err);
            }

            // 3. 暴露全局接口
            window[GLOBAL_KEYS.avatarSwitch] = {
                destroy: () => {
                    AvatarSwitchModule.destroy();
                    ExtensionJSManager.destroy();
                }
            };
        }
    };

    AppManager.init();
})();