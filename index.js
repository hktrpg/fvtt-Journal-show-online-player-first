console.log('start2')
Hooks.once('ready', () => {
    console.log('ready translate')
    const collection = new CollectionItem();
    init()
});

let flag = {
    zh_tw: true,
    all_players: true
}
class CollectionItem {
    constructor() {
        this.items = []
    }
    // create a new player and save it in the collection
    newItem(detail) {
        if (collection.allItemsName.includes(detail.name) || detail.ENG_name === "At Higher Levels") return;
        let item = new Item(detail)
        this.items.push(item)
        return item
    }
    get allItems() {
        return this.items
    }
    get allItemsName() {
        return this.items.map(item => item.name)
    }
    targetItem(name) {
        return this.items.find(item => item.ENG_name === name)
    }
    // this could include summary stats like average score, etc. For simplicy, just the count for now
    get numberOfItems() {
        return this.items.length
    }
}


class Item {
    constructor({ name, ENG_name, entries }) {
        this.name = name;
        this.ENG_name = ENG_name;
        this.entries = entries.join("\n");
    }
}



function readFolderJson(folder) {
    let files = fs.readdirSync(folder);
    let data = [];
    files.forEach(file => {
        if (file.includes('.json')) {
            let json = JSON.parse(fs.readFileSync(folder + '/' + file, 'utf8'));
            data.push(json);
        }
    })
    return data;
}


function searchTargetKey(obj, keys) {
    try {
        if (keys.includes('name') && keys.includes('ENG_name') && keys.includes('entries')) {
            collection.newItem({ name: obj['name'], ENG_name: obj['ENG_name'], entries: obj['entries'] });
        }
    } catch (error) {
        return;
    }

}

function handlingObject(data) {
    const keys = findObjectKey(data);
    searchTargetKey(data, keys);//搜索所有object有沒有三個指定的key
    keys.forEach(key => {
        if (data[key] instanceof Array) {
            data[key].forEach(item => {
                handlingObject(item);
            })
        }
        if (data[key] instanceof Object) {
            handlingObject(data[key]);
        }
    })
}
function handlingdatas(datas) {
    datas.forEach(data => {
        handlingObject(data)
    })
}
function loadingJson() {
    let datas = [];
    datas.push(readFolderJson('./data'))
    datas.push(readFolderJson('./data/spells'))
    datas.push(readFolderJson('./data/class'))
    return datas;
}

function findObjectKey(object) {
    try {
        const keys = Object.keys(object);
        return keys;
    } catch (error) {
        return []
    }

}
function findActor(name) {
    return game.actors.find(actor => actor.name === name)
}



function translateItems(name) {
    let actor = findActor(name)
    actor.data.items.forEach(item => {
        let actorItem = collection.targetItem(item.name);
        if (actorItem) {
            item.data.data.description.value = actorItem.entries;
        }
    })

}


function init() {
    let datas = loadingJson();
    handlingdatas(datas);
    console.log(collection.numberOfItems)
    //console.log(JSON.stringify(collection.allItemsName))
    //translateItems('QAQ')
}





/**
 * 1. 讀取所有資料庫.JSON
 *      i. 找出所有object 及 array
 *      ii. 找出所有object 及 array 的名稱
 *      iii. 找出同時擁有name eng_name及entries的object
 * 2. 放進class: classes, items, spells, feats
 * 3. 讀取FVTT 角色卡資料
 * 4. 對比 角色卡資料和資料庫資料
 * 5. 取代角色卡資料
 * 
 */