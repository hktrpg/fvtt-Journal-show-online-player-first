
Hooks.once("init", () => {
    console.log("Show Online player First 1.0 | Initializing");
});

Hooks.on(['renderDialog', 'renderShowToPlayersDialog'], () => {
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


Hooks.on(['renderApplication', 'renderHandlebarsApplication','renderFormApplication '], () => {
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


function reorderFormGroups(playerNames) {
	// Target ownership configuration forms (v12 + v13)
	const v13Forms = Array.from(document.querySelectorAll('form.document-ownership'));
	const v12Forms = Array.from(document.querySelectorAll('form#permission-control'));
	const ownershipForms = [...v13Forms, ...v12Forms];
	if (ownershipForms.length === 0) return;

	ownershipForms.forEach((form) => {
		// v13 uses <menu.standard-form>, v12 uses the <form> itself
		const listContainer = form.querySelector('menu.standard-form, menu.standard-form.scrollable') || form;
		if (!listContainer) return;

		// Only direct children that are form groups
		const items = Array.from(listContainer.children).filter(el => el.classList && el.classList.contains('form-group'));
		if (items.length === 0) return;

		// Fixed rows: GM(s), All Players row, and the GM toggle row (v12)
		const isFixed = (el) => {
			if (el.classList.contains('gm')) return true;
			const lbl = el.querySelector('label');
			const text = (lbl ? lbl.textContent : '').trim().toLowerCase();
			if (!lbl && !el.querySelector('label')) return false;
			if (text.includes('所有玩家') || text.includes('all players')) return true;
			// GM visibility toggle in v12
			if (text.includes('顯示gm用戶') || text.includes('show gm')) return true;
			if (el.querySelector('#show-gm-toggle') || el.querySelector('[data-show-gm-toggle]')) return true;
			return false;
		};

		const fixedItems = items.filter(isFixed);
		const nonFixedItems = items.filter(el => !isFixed(el));

		// Map player name -> element for non-fixed items
		const nameToItem = new Map();
		for (const el of nonFixedItems) {
			const lbl = el.querySelector('label');
			if (!lbl) continue;
			const name = lbl.textContent.trim();
			if (playerNames.includes(name)) nameToItem.set(name, el);
		}

		// Insert online players immediately after the last fixed item
		let lastFixed = fixedItems.length > 0 ? fixedItems[fixedItems.length - 1] : null;
		for (const name of playerNames) {
			const el = nameToItem.get(name);
			if (el && listContainer.contains(el)) {
				if (lastFixed && lastFixed.parentElement === listContainer) {
					if (lastFixed.nextSibling) {
						listContainer.insertBefore(el, lastFixed.nextSibling);
					} else {
						listContainer.appendChild(el);
					}
					lastFixed = el; // keep online players contiguous in given order
				} else {
					// No fixed anchor; just move to top of the container
					listContainer.insertBefore(el, listContainer.firstChild);
					lastFixed = el;
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