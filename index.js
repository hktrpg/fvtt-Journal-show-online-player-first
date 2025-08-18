
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

function reorderFormGroups(players) {
    const formGroups = document.querySelectorAll('.form-group');
    if (!formGroups) return;
    // 找到 players 包含的 form-group
    const selectedFormGroups = [];
    formGroups.forEach((formGroup) => {
        const label = formGroup.querySelector('label');
        if (label && players.includes(label.textContent)) {
            selectedFormGroups.push(formGroup);
        }
    });

    // 把選中的 form-group 移动到 hidden 的后面
    const hiddenFormGroup = document.querySelector('.form-group.hidden');
    selectedFormGroups.forEach((formGroup) => {
        hiddenFormGroup.parentNode.insertBefore(formGroup, hiddenFormGroup.nextSibling);
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