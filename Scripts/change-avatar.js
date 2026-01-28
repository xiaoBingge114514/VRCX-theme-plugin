/* %AppData%/VRCX/custom.js */
/* 使用脚本后果自负！ */


(() => {
    const STORAGE_KEY = 'vrcx_custom_switch_avatar_map';
    const CHECK_INTERVAL_MS = 2000;
    const MIN_RETRY_MS = 10000;

    const AVATAR_ID_REGEX =
        /avtr_[0-9A-Fa-f]{8}-([0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}/;

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
        lastAvatarId: '',
        lastAttemptAt: 0,
        warnedInvalidId: false,
        lastIsDark: null,
        themeElements: null,
        locationChangedAt: 0,
        seenLocationTag: ''
    };

    function getSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return {
                    enabled: true,
                    mapA: { avatarId: '', types: [] },
                    mapB: { avatarId: '', types: [] }
                };
            }
            const parsed = JSON.parse(raw);
            return {
                enabled: parsed?.enabled !== false,
                mapA: {
                    avatarId: String(parsed?.mapA?.avatarId || ''),
                    manualId: String(parsed?.mapA?.manualId || ''),
                    types: Array.isArray(parsed?.mapA?.types)
                        ? parsed.mapA.types
                        : []
                },
                mapB: {
                    avatarId: String(parsed?.mapB?.avatarId || ''),
                    manualId: String(parsed?.mapB?.manualId || ''),
                    types: Array.isArray(parsed?.mapB?.types)
                        ? parsed.mapB.types
                        : []
                }
            };
        } catch (err) {
            console.warn('[custom.js] Failed to parse settings:', err);
            return {
                enabled: true,
                mapA: { avatarId: '', types: [] },
                mapB: { avatarId: '', types: [] }
            };
        }
    }

    function setSettings(settings) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }

    function getStores() {
        if (!window.$pinia) {
            return null;
        }
        return {
            user: window.$pinia.user,
            avatar: window.$pinia.avatar,
            appearanceSettings: window.$pinia.appearanceSettings,
            game: window.$pinia.game,
            location: window.$pinia.location,
            instance: window.$pinia.instance
        };
    }

    function getIsDarkMode() {
        const stores = getStores();
        const isDarkRef = stores?.appearanceSettings?.isDarkMode;
        if (typeof isDarkRef === 'boolean') {
            return isDarkRef;
        }
        if (isDarkRef && typeof isDarkRef.value === 'boolean') {
            return isDarkRef.value;
        }
        return false;
    }

    function readRef(value) {
        if (value && typeof value === 'object' && 'value' in value) {
            return value.value;
        }
        return value;
    }

    function applyTheme() {
        if (!state.themeElements) {
            return;
        }
        const isDark = getIsDarkMode();
        if (state.lastIsDark === isDark) {
            return;
        }
        state.lastIsDark = isDark;

        const colors = isDark
            ? {
                  panel: '#1f2124',
                  text: '#f1f1f1',
                  textMuted: '#b7b7b7',
                  border: 'rgba(255,255,255,0.18)',
                  button: '#2c2f34',
                  buttonAlt: '#2a2d31',
                  accent: '#7aa2ff'
              }
            : {
                  panel: '#ffffff',
                  text: '#111111',
                  textMuted: '#666666',
                  border: 'rgba(0,0,0,0.2)',
                  button: '#f2f2f2',
                  buttonAlt: '#f6f6f6',
                  accent: '#3b6cff'
              };

        const {
            button,
            panel,
            title,
            status,
            enabledToggle,
            reloadBtn,
            selectA,
            selectB,
            manualA,
            manualB,
            typesA,
            typesB,
            saveBtn,
            closeBtn
        } = state.themeElements;

        panel.style.background = colors.panel;
        panel.style.border = `1px solid ${colors.border}`;
        panel.style.color = colors.text;

        button.style.background = colors.button;
        button.style.border = `1px solid ${colors.border}`;
        button.style.color = colors.text;

        title.style.color = colors.text;
        status.style.color = colors.textMuted;

        reloadBtn.style.background = colors.buttonAlt;
        reloadBtn.style.border = `1px solid ${colors.border}`;
        reloadBtn.style.color = colors.text;

        enabledToggle.style.accentColor = colors.accent;

        saveBtn.style.background = colors.accent;
        saveBtn.style.border = `1px solid ${colors.border}`;
        saveBtn.style.color = colors.text;

        closeBtn.style.background = colors.buttonAlt;
        closeBtn.style.border = `1px solid ${colors.border}`;
        closeBtn.style.color = colors.text;

        const inputs = [selectA, selectB, manualA, manualB];
        for (const input of inputs) {
            input.style.background = colors.panel;
            input.style.border = `1px solid ${colors.border}`;
            input.style.color = colors.text;
        }

        for (const input of typesA.checkboxes.values()) {
            input.style.accentColor = colors.accent;
        }
        for (const input of typesB.checkboxes.values()) {
            input.style.accentColor = colors.accent;
        }
    }

    function buildUi() {
        if (document.getElementById('vrcx-custom-switch-ui')) {
            return;
        }

        const settings = getSettings();
        const root = document.createElement('div');
        root.id = 'vrcx-custom-switch-ui';
        root.style.position = 'fixed';
        root.style.right = '60px';
        root.style.bottom = '18px';
        root.style.zIndex = '9999';
        root.style.fontFamily = 'system-ui, sans-serif';

        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Avatar';
        button.style.padding = '8px 10px';
        button.style.borderRadius = '15px';
        button.style.border = '1px solid rgba(0,0,0,0.2)';
        button.style.background = '#f2f2f2';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';

        const panel = document.createElement('div');
        panel.style.position = 'absolute';
        panel.style.right = '0';
        panel.style.bottom = '46px';
        panel.style.minWidth = '260px';
        panel.style.padding = '10px';
        panel.style.borderRadius = '10px';
        panel.style.border = '1px solid rgba(0,0,0,0.2)';
        panel.style.background = '#ffffff';
        panel.style.boxShadow = '0 6px 16px rgba(0,0,0,0.18)';
        panel.style.display = 'none';

        const title = document.createElement('div');
        title.textContent = 'Avatar Switch Rules';
        title.style.fontWeight = '600';
        title.style.marginBottom = '8px';

        const enabledLabel = document.createElement('label');
        enabledLabel.style.display = 'flex';
        enabledLabel.style.alignItems = 'center';
        enabledLabel.style.gap = '6px';
        enabledLabel.style.fontSize = '12px';
        enabledLabel.style.marginBottom = '8px';

        const enabledToggle = document.createElement('input');
        enabledToggle.type = 'checkbox';
        enabledToggle.checked = settings.enabled !== false;
        const enabledText = document.createElement('span');
        enabledText.textContent = 'Enable auto switch';
        enabledLabel.appendChild(enabledToggle);
        enabledLabel.appendChild(enabledText);

        const status = document.createElement('div');
        status.style.fontSize = '12px';
        status.style.color = '#666';
        status.style.marginBottom = '8px';
        status.textContent = 'Avatars not loaded';

        const reloadBtn = document.createElement('button');
        reloadBtn.type = 'button';
        reloadBtn.textContent = 'Load my avatars';
        reloadBtn.style.width = '100%';
        reloadBtn.style.marginBottom = '8px';
        reloadBtn.style.padding = '6px 8px';
        reloadBtn.style.borderRadius = '6px';
        reloadBtn.style.border = '1px solid rgba(0,0,0,0.2)';
        reloadBtn.style.background = '#f6f6f6';
        reloadBtn.style.cursor = 'pointer';

        function makeSelect() {
            const select = document.createElement('select');
            select.style.width = '100%';
            select.style.padding = '6px 8px';
            select.style.borderRadius = '6px';
            select.style.border = '1px solid rgba(0,0,0,0.25)';
            select.style.boxSizing = 'border-box';
            select.style.marginBottom = '8px';
            return select;
        }

        function makeTextInput(placeholder) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = placeholder;
            input.style.width = '100%';
            input.style.padding = '6px 8px';
            input.style.borderRadius = '6px';
            input.style.border = '1px solid rgba(0,0,0,0.25)';
            input.style.boxSizing = 'border-box';
            input.style.marginBottom = '8px';
            return input;
        }

        function fillAvatarOptions(select, avatars, selectedId) {
            select.innerHTML = '';
            const empty = document.createElement('option');
            empty.value = '';
            empty.textContent = 'None';
            select.appendChild(empty);
            for (const avatar of avatars) {
                const option = document.createElement('option');
                option.value = avatar.id;
                option.textContent = avatar.name || avatar.id;
                select.appendChild(option);
            }
            select.value = selectedId || '';
        }

        function makeTypeChecklist(selectedTypes) {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'grid';
            wrapper.style.gridTemplateColumns = '1fr 1fr';
            wrapper.style.gap = '4px 8px';
            wrapper.style.marginBottom = '8px';
            const checkboxes = new Map();
            for (const type of LOCATION_TYPES) {
                const label = document.createElement('label');
                label.style.display = 'flex';
                label.style.alignItems = 'center';
                label.style.gap = '6px';
                label.style.fontSize = '12px';
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.value = type.key;
                input.checked = selectedTypes.includes(type.key);
                const text = document.createElement('span');
                text.textContent = type.label;
                label.appendChild(input);
                label.appendChild(text);
                wrapper.appendChild(label);
                checkboxes.set(type.key, input);
            }
            return { wrapper, checkboxes };
        }

        const sectionA = document.createElement('div');
        sectionA.style.borderTop = '1px solid rgba(0,0,0,0.08)';
        sectionA.style.paddingTop = '8px';
        sectionA.style.marginTop = '8px';

        const sectionATitle = document.createElement('div');
        sectionATitle.textContent = 'Rule A';
        sectionATitle.style.fontWeight = '600';
        sectionATitle.style.marginBottom = '6px';

        const selectA = makeSelect();
        const manualA = makeTextInput('Manual avatar ID (optional)');
        manualA.value = settings.mapA.manualId || '';
        const typesA = makeTypeChecklist(settings.mapA.types);

        sectionA.appendChild(sectionATitle);
        sectionA.appendChild(selectA);
        sectionA.appendChild(manualA);
        sectionA.appendChild(typesA.wrapper);

        const sectionB = document.createElement('div');
        sectionB.style.borderTop = '1px solid rgba(0,0,0,0.08)';
        sectionB.style.paddingTop = '8px';
        sectionB.style.marginTop = '8px';

        const sectionBTitle = document.createElement('div');
        sectionBTitle.textContent = 'Rule B';
        sectionBTitle.style.fontWeight = '600';
        sectionBTitle.style.marginBottom = '6px';

        const selectB = makeSelect();
        const manualB = makeTextInput('Manual avatar ID (optional)');
        manualB.value = settings.mapB.manualId || '';
        const typesB = makeTypeChecklist(settings.mapB.types);

        sectionB.appendChild(sectionBTitle);
        sectionB.appendChild(selectB);
        sectionB.appendChild(manualB);
        sectionB.appendChild(typesB.wrapper);

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '6px';

        const saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.textContent = 'Save';
        saveBtn.style.flex = '1';
        saveBtn.style.padding = '6px 8px';
        saveBtn.style.borderRadius = '6px';
        saveBtn.style.border = '1px solid rgba(0,0,0,0.2)';
        saveBtn.style.background = '#e6f0ff';
        saveBtn.style.cursor = 'pointer';

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.textContent = 'Close';
        closeBtn.style.flex = '1';
        closeBtn.style.padding = '6px 8px';
        closeBtn.style.borderRadius = '6px';
        closeBtn.style.border = '1px solid rgba(0,0,0,0.2)';
        closeBtn.style.background = '#f6f6f6';
        closeBtn.style.cursor = 'pointer';

        function getAvatarList() {
            const stores = getStores();
            const list = stores?.user?.userDialog?.avatars || [];
            const avatars = Array.from(list);
            avatars.sort((a, b) =>
                String(a.name || a.id).localeCompare(String(b.name || b.id))
            );
            return avatars;
        }

        function updateAvatarUi() {
            const avatars = getAvatarList();
            if (!avatars.length) {
                status.textContent = 'Avatars not loaded';
            } else {
                status.textContent = `Avatars loaded: ${avatars.length}`;
            }
            const currentSettings = getSettings();
            fillAvatarOptions(selectA, avatars, currentSettings.mapA.avatarId);
            fillAvatarOptions(selectB, avatars, currentSettings.mapB.avatarId);
            manualA.value = currentSettings.mapA.manualId || '';
            manualB.value = currentSettings.mapB.manualId || '';
            enabledToggle.checked = currentSettings.enabled !== false;
        }

        function loadAvatars() {
            const stores = getStores();
            if (!stores?.user || !stores?.avatar) {
                return;
            }
            if (!stores.user.currentUser?.id) {
                return;
            }
            stores.user.userDialog.id = stores.user.currentUser.id;
            stores.user.refreshUserDialogAvatars();
        }

        saveBtn.addEventListener('click', () => {
            const mapA = {
                avatarId: selectA.value.trim(),
                manualId: manualA.value.trim(),
                types: []
            };
            const mapB = {
                avatarId: selectB.value.trim(),
                manualId: manualB.value.trim(),
                types: []
            };
            for (const [key, input] of typesA.checkboxes.entries()) {
                if (input.checked) {
                    mapA.types.push(key);
                }
            }
            for (const [key, input] of typesB.checkboxes.entries()) {
                if (input.checked && !mapA.types.includes(key)) {
                    mapB.types.push(key);
                }
            }
            setSettings({
                enabled: enabledToggle.checked,
                mapA,
                mapB
            });
            panel.style.display = 'none';
        });

        closeBtn.addEventListener('click', () => {
            panel.style.display = 'none';
        });

        button.addEventListener('click', () => {
            updateAvatarUi();
            if (!getAvatarList().length) {
                loadAvatars();
                setTimeout(updateAvatarUi, 1500);
            }
            panel.style.display =
                panel.style.display === 'none' ? 'block' : 'none';
        });

        reloadBtn.addEventListener('click', () => {
            status.textContent = 'Loading...';
            loadAvatars();
            setTimeout(updateAvatarUi, 1500);
        });

        panel.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        document.addEventListener('click', (event) => {
            if (!panel.contains(event.target) && event.target !== button) {
                panel.style.display = 'none';
            }
        });

        actions.appendChild(saveBtn);
        actions.appendChild(closeBtn);
        panel.appendChild(title);
        panel.appendChild(enabledLabel);
        panel.appendChild(status);
        panel.appendChild(reloadBtn);
        panel.appendChild(sectionA);
        panel.appendChild(sectionB);
        panel.appendChild(actions);
        root.appendChild(button);
        root.appendChild(panel);
        document.body.appendChild(root);

        state.themeElements = {
            button,
            panel,
            title,
            status,
            enabledToggle,
            reloadBtn,
            selectA,
            selectB,
            manualA,
            manualB,
            typesA,
            typesB,
            saveBtn,
            closeBtn
        };
        applyTheme();
    }

    function parseLocationTag(tag) {
        const info = {
            accessType: '',
            groupAccessType: '',
            accessTypeName: '',
            canRequestInvite: false
        };
        const value = String(tag || '');
        if (
            value === 'offline' ||
            value === 'offline:offline' ||
            value === 'private' ||
            value === 'private:private' ||
            value === 'traveling' ||
            value === 'traveling:traveling' ||
            value.startsWith('local')
        ) {
            return info;
        }
        const sep = value.indexOf(':');
        if (sep < 0) {
            return info;
        }
        info.accessType = 'public';
        const instanceId = value.slice(sep + 1);
        const parts = instanceId.split('~').slice(1);
        for (const part of parts) {
            const open = part.indexOf('(');
            const close = part.lastIndexOf(')');
            const key = open >= 0 ? part.slice(0, open) : part;
            const val =
                open >= 0 && close > open ? part.slice(open + 1, close) : '';
            if (key === 'private') {
                info.accessType = 'invite';
            } else if (key === 'hidden') {
                info.accessType = 'friends+';
            } else if (key === 'friends') {
                info.accessType = 'friends';
            } else if (key === 'canRequestInvite') {
                info.canRequestInvite = true;
            } else if (key === 'group') {
                info.accessType = 'group';
            } else if (key === 'groupAccessType') {
                info.groupAccessType = val;
            }
        }
        if (info.accessType === 'invite' && info.canRequestInvite) {
            info.accessType = 'invite+';
        }
        if (info.accessType === 'group') {
            if (info.groupAccessType === 'public') {
                info.accessTypeName = 'groupPublic';
            } else if (info.groupAccessType === 'plus') {
                info.accessTypeName = 'groupPlus';
            }
        } else {
            info.accessTypeName = info.accessType;
        }
        return info;
    }

    function getCurrentLocationInfo(userStore) {
        const currentUser = userStore?.currentUser;
        const cachedUser = userStore?.cachedUsers?.get?.(currentUser?.id);
        if (cachedUser?.$location && typeof cachedUser.$location === 'object') {
            return cachedUser.$location;
        }
        const locationTag =
            currentUser?.$locationTag || currentUser?.presence?.world || '';
        return parseLocationTag(locationTag);
    }

    function isTraveling(locationInfo, userStore) {
        if (locationInfo?.isTraveling) {
            return true;
        }
        const currentUser = userStore?.currentUser;
        const locationTag = currentUser?.$locationTag || '';
        return (
            locationTag === 'traveling' ||
            locationTag === 'traveling:traveling'
        );
    }

    function getLocationType(locationInfo) {
        if (!locationInfo) {
            return '';
        }
        if (locationInfo.accessType === 'group') {
            if (
                locationInfo.groupAccessType === 'public' ||
                locationInfo.accessTypeName === 'groupPublic'
            ) {
                return 'groupPublic';
            }
            if (
                locationInfo.groupAccessType === 'plus' ||
                locationInfo.accessTypeName === 'groupPlus'
            ) {
                return 'groupPlus';
            }
            return 'group';
        }
        if (locationInfo.accessType === 'invite') {
            if (locationInfo.canRequestInvite) {
                return 'invite+';
            }
        }
        return locationInfo.accessType || '';
    }

    function getTargetAvatarId(locationType, settings) {
        const mapA = settings?.mapA;
        const mapB = settings?.mapB;
        const manualA = mapA?.manualId?.trim?.() || '';
        const manualB = mapB?.manualId?.trim?.() || '';
        if (
            manualA &&
            AVATAR_ID_REGEX.test(manualA) &&
            Array.isArray(mapA.types) &&
            mapA.types.includes(locationType)
        ) {
            return manualA;
        }
        if (
            manualB &&
            AVATAR_ID_REGEX.test(manualB) &&
            Array.isArray(mapB.types) &&
            mapB.types.includes(locationType)
        ) {
            return manualB;
        }
        if (
            mapA?.avatarId &&
            AVATAR_ID_REGEX.test(mapA.avatarId) &&
            Array.isArray(mapA.types) &&
            mapA.types.includes(locationType)
        ) {
            return mapA.avatarId;
        }
        if (
            mapB?.avatarId &&
            AVATAR_ID_REGEX.test(mapB.avatarId) &&
            Array.isArray(mapB.types) &&
            mapB.types.includes(locationType)
        ) {
            return mapB.avatarId;
        }
        return '';
    }

    function shouldAttempt(locationTag, currentAvatarId) {
        if (
            state.lastLocationTag === locationTag &&
            state.lastAvatarId === currentAvatarId
        ) {
            return false;
        }
        if (
            state.lastLocationTag === locationTag &&
            Date.now() - state.lastAttemptAt < MIN_RETRY_MS
        ) {
            return false;
        }
        return true;
    }

    async function selectAvatarDirect(avatarId, userStore) {
        if (!window.webApiService || !window.$debug?.endpointDomain) {
            console.warn('[custom.js] webApiService or endpoint missing.');
            return;
        }
        const url = `${window.$debug.endpointDomain}/avatars/${avatarId}/select`;
        console.log('[custom.js] select avatar via API:', url);
        try {
            const response = await window.webApiService.execute({
                url,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: '{}'
            });
            console.log('[custom.js] select response:', response);
            if (response?.status === 200 && response?.data) {
                try {
                    const json = JSON.parse(response.data);
                    console.log('[custom.js] select response json:', json);
                    if (userStore?.applyCurrentUser) {
                        userStore.applyCurrentUser(json);
                    }
                } catch (err) {
                    console.warn('[custom.js] Failed to parse select response', err);
                }
            }
        } catch (err) {
            console.warn('[custom.js] Avatar select failed', err);
        }
    }

    function tick() {
        const stores = getStores();
        if (!stores?.user) {
            return;
        }

        const currentUser = stores.user.currentUser;
        if (!currentUser?.id) {
            return;
        }
        applyTheme();

        const locationTag = currentUser.$locationTag || '';
        if (locationTag !== state.seenLocationTag) {
            state.seenLocationTag = locationTag;
            state.locationChangedAt = Date.now();
            console.log('[custom.js] location changed:', locationTag);
        }
        const locationInfo = getCurrentLocationInfo(stores.user);
        if (isTraveling(locationInfo, stores.user)) {
            console.log('[custom.js] traveling, skip');
            return;
        }
        if (!stores.game?.isGameRunning) {
            console.log('[custom.js] game not running, skip');
            return;
        }
        const instanceWorld = readRef(stores.instance?.currentInstanceWorld);
        const instanceWorldId = instanceWorld?.ref?.id;
        if (!instanceWorldId) {
            console.log('[custom.js] instance world not ready, skip');
            return;
        }
        const usersData = readRef(stores.instance?.currentInstanceUsersData);
        if (!Array.isArray(usersData) || usersData.length === 0) {
            console.log('[custom.js] player list empty, skip');
            return;
        }
        const locationType = getLocationType(locationInfo);
        if (!locationType || !LOCATION_TYPES.some((t) => t.key === locationType)) {
            state.lastLocationTag = locationTag;
            state.lastAvatarId = currentUser.currentAvatar || '';
            console.log('[custom.js] unsupported location type:', locationType);
            return;
        }
        if (Date.now() - state.locationChangedAt < 2000) {
            return;
        }

        const currentAvatarId = currentUser.currentAvatar || '';
        const settings = getSettings();
        if (settings.enabled === false) {
            return;
        }
        const targetAvatarId = getTargetAvatarId(locationType, settings);
        if (!targetAvatarId) {
            if (!state.warnedInvalidId) {
                console.warn('[custom.js] No valid avatar mapping for location type.');
                state.warnedInvalidId = true;
            }
            return;
        }
        state.warnedInvalidId = false;

        if (currentAvatarId === targetAvatarId) {
            state.lastLocationTag = locationTag;
            state.lastAvatarId = currentAvatarId;
            console.log('[custom.js] already on target avatar');
            return;
        }

        if (!shouldAttempt(locationTag, currentAvatarId)) {
            console.log('[custom.js] throttled, skip');
            return;
        }

        state.lastLocationTag = locationTag;
        state.lastAvatarId = currentAvatarId;
        state.lastAttemptAt = Date.now();
        selectAvatarDirect(targetAvatarId, stores.user);
    }

    function start() {
        if (!window.$pinia) {
            setTimeout(start, 500);
            return;
        }
        buildUi();
        setInterval(tick, CHECK_INTERVAL_MS);
        tick();
    }

    start();
})();
