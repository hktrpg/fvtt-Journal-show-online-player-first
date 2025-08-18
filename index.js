
Hooks.once("init", () => {
    console.log("Show Online player First 1.0 | Initializing");
});

Hooks.on('renderDialog', () => {
    try {
        const users = game.users.filter(user => user.active);
        let playerNames = users.map(u => u.name)
        // v13 container
        sortLabel('.users', playerNames)
        // v12 container
        sortLabel('.form-fields', playerNames)
    } catch (error) {
        console.log('error', error)
    }
});

// v13 renamed hook; support both without version checks
Hooks.on('renderShowToPlayersDialog', () => {
    try {
        const users = game.users.filter(user => user.active);
        let playerNames = users.map(u => u.name)
        // v13 container
        sortLabel('.users', playerNames)
        // v12 container
        sortLabel('.form-fields', playerNames)
    } catch (error) {
        console.log('error', error)
    }
});


Hooks.on('renderApplication', () => {
    try {
        const users = game.users.filter(user => user.active);
        let playerNames = users.map(u => u.name)
        //permission-control
        reorderFormGroups(playerNames);
    } catch (error) {
        // console.log('error', error)
    }
});

// v13 renamed hook; support both without version checks
Hooks.on('renderHandlebarsApplication', () => {
    try {
        const users = game.users.filter(user => user.active);
        let playerNames = users.map(u => u.name)
        reorderFormGroups(playerNames);
    } catch (error) {
        // console.log('error', error)
    }
});

function reorderFormGroups(playerNames) {
    // Target ownership configuration forms (v12/v13)
    const ownershipForms = document.querySelectorAll('form.document-ownership');
    if (!ownershipForms || ownershipForms.length === 0) return;

    ownershipForms.forEach((form) => {
        // Preferred container in v13
        const listContainer = form.querySelector('menu.standard-form') || form.querySelector('menu.standard-form.scrollable') || form;
        if (!listContainer) return;

        // Work only with direct children that are form groups
        const items = Array.from(listContainer.children).filter(el => el.classList && el.classList.contains('form-group'));
        if (items.length === 0) return;

        // Identify fixed entries: All Players row and GM row(s)
        const isFixed = (el) => {
            if (el.classList.contains('gm')) return true;
            const lbl = el.querySelector('label');
            if (!lbl) return false;
            const text = lbl.textContent.trim().toLowerCase();
            return text.includes('所有玩家') || text.includes('all players');
        };

        const fixedItems = items.filter(isFixed);
        const nonFixedItems = items.filter(el => !isFixed(el));

        // Build map of player name -> element for non-fixed items
        const nameToItem = new Map();
        for (const el of nonFixedItems) {
            const lbl = el.querySelector('label');
            if (!lbl) continue;
            const name = lbl.textContent.trim();
            if (playerNames.includes(name)) nameToItem.set(name, el);
        }

        // Insert online players immediately after the fixed items, preserving playerNames order
        const anchor = nonFixedItems.find(el => !nameToItem.has(el.querySelector('label')?.textContent.trim())) || nonFixedItems[0] || null;
        for (const name of playerNames) {
            const el = nameToItem.get(name);
            if (el && listContainer.contains(el)) {
                if (anchor) {
                    listContainer.insertBefore(el, anchor);
                } else {
                    listContainer.appendChild(el);
                }
            }
        }
    });
}

function sortLabel(className, playerNames) {
    const root = document.querySelector(className);
    if (!root) return;

    // Collect all player labels under the root
    const allLabels = Array.from(root.querySelectorAll('label.checkbox'));
    if (allLabels.length === 0) return;

    // Group labels by their immediate parent container so we only reorder within the same container
    const parentToLabels = new Map();
    for (const label of allLabels) {
        const parent = label.parentElement;
        if (!parent) continue;
        if (!parentToLabels.has(parent)) parentToLabels.set(parent, []);
        parentToLabels.get(parent).push(label);
    }

    // For each parent container, build a map of playerName -> label and move matches to the front in the given order
    for (const [parent, labels] of parentToLabels.entries()) {
        const nameToLabel = new Map();
        for (const label of labels) {
            const nameSpan = label.querySelector('span');
            const labelText = (nameSpan ? nameSpan.textContent : label.textContent).trim();
            if (playerNames.includes(labelText)) {
                nameToLabel.set(labelText, label);
            }
        }

        // Insert in reverse to preserve the playerNames order at the front
        for (let i = playerNames.length - 1; i >= 0; i--) {
            const playerName = playerNames[i];
            const label = nameToLabel.get(playerName);
            if (label && parent.contains(label)) {
                parent.insertBefore(label, parent.firstChild);
            }
        }
    }
}