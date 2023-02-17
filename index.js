
Hooks.once("init", () => {
    console.log("Show Online player First | Initializing");
});

Hooks.on('renderDialog', () => {
    try {
        const users = game.users.filter(user => user.active);
        let playerNames = users.map(u => u.name)
        sortLabel('.form-fields', playerNames)
        sortLabel('.show-to-players', playerNames)


    } catch (error) {
        console.log('error', error)
    }
});

function sortLabel(className, playerNames) {
    const formFields = document.querySelector(className);
    const playerLabels = formFields.querySelectorAll('label.checkbox');
    const playerMap = new Map();
    // 將符合條件的玩家名稱及對應的標籤放入map中
    playerLabels.forEach(label => {
        console.log('label', label)
        const playerName = label.textContent.trim();
        if (playerNames.includes(playerName)) {
            playerMap.set(playerName, label);
        }
    });
    // 將map中的標籤依序放在前面
    playerNames.forEach(playerName => {
        const label = playerMap.get(playerName);
        if (label) {
            formFields.insertBefore(label, formFields.firstChild);
        }
    });
}