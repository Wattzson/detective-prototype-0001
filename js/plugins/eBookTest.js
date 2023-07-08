/*:
 * @plugindesc Adds a database/log feature to the game menu.
 * @author Your Name
 *
 * @param Open eBook
 * @desc The name of the menu command that opens the database/log.
 * @default Database
 *
 * @command AddDatabaseEntry
 * @text Add Database Entry
 * @desc Adds a new entry to the database/log.
 *
 * @arg entryType
 * @type text
 * @text Entry Type
 * @desc The type of entry to add (e.g. "npc", "location", "clue").
 *
 * @arg entryId
 * @type number
 * @text Entry ID
 * @desc The ID of the entry to add.
 *
 * @arg entryData
 * @type note
 * @text Entry Data
 * @desc The data for the entry, specified as a JSON object.
 *
 * ...
 */

var parameters = PluginManager.parameters('eBookTest');
var menuCommandName = String(parameters['Open eBook']);

// Add a new command to the game's menu that opens the database/log when selected.
var _Window_MenuCommand_addOriginalCommands =
    Window_MenuCommand.prototype.addOriginalCommands;
Window_MenuCommand.prototype.addOriginalCommands = function() {
    _Window_MenuCommand_addOriginalCommands.call(this);
    this.addCommand(menuCommandName, 'database');
};

// Handle the new menu command by opening the database/log scene.
var _Scene_Menu_createCommandWindow =
    Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
    _Scene_Menu_createCommandWindow.call(this);
    this._commandWindow.setHandler('database', this.commandDatabase.bind(this));
};

Scene_Menu.prototype.commandDatabase = function() {
    SceneManager.push(Scene_Database);
};

// Define a new scene class for displaying the database/log.
function Scene_Database() {
    this.initialize.apply(this, arguments);
}

Scene_Database.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Database.prototype.constructor = Scene_Database;

Scene_Database.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Database.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);

    var rect = new Rectangle(0, 0, Graphics.boxWidth, Graphics.boxHeight);
    this._databaseWindow = new Window_Database(rect);
    this.addWindow(this._databaseWindow);

    var listWidth = 240;
    var listHeight = Graphics.boxHeight;
    rect = new Rectangle(0, 0, listWidth, listHeight);
    this._listWindow = new Window_DatabaseList(rect);
    this._listWindow.setHandler('ok', this.onListOk.bind(this));
    this._listWindow.setHandler('cancel', this.popScene.bind(this));
    this.addWindow(this._listWindow);

    this._databaseWindow.setListWindow(this._listWindow);
    this._databaseWindow.setHandler('cancel', this.popScene.bind(this));
};

// Scene_Database.prototype.goBackToDatabaseList = function() {
//     this._databaseWindow.deselect();
//     this._databaseWindow.deactivate();
//     this._listWindow.activate();
// };


Scene_Database.prototype.onListOk = function() {
    var index = this._listWindow.index();
    var item = this._listWindow.itemAt(index);
    if (item) {
        this._databaseWindow.setEntry(item.type, item.id);
        this._listWindow.deactivate();
        this._databaseWindow.activate();
    }
};

Scene_Database.prototype.onDatabaseCancel = function() {
    this._databaseWindow.deselect();
    this._databaseWindow.deactivate();
    this._listWindow.deselect();
    this._listWindow.activate();
};


// Define a new window class for displaying a list of entries in the database/log.
function Window_DatabaseList() {
    this.initialize.apply(this, arguments);
}

Window_DatabaseList.prototype = Object.create(Window_Selectable.prototype);
Window_DatabaseList.prototype.constructor = Window_DatabaseList;

Window_DatabaseList.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.refresh();
};

Window_DatabaseList.prototype.maxItems = function() {
    return this._data ? this._data.length : 0;
};

Window_DatabaseList.prototype.itemAt = function(index) {
    return this._data ? this._data[index] : null;
};

Window_DatabaseList.prototype.drawItem = function(index) {
    var item = this.itemAt(index);
    if (item) {
        var rect = this.itemLineRect(index);
        var text = item.name;
        if (item.type === 'npc') {
            text += ' (NPC)';
        } else if (item.type === 'location') {
            text += ' (Location)';
        } else if (item.type === 'clue') {
            text += ' (Clue)';
        }
        this.drawText(text, rect.x, rect.y, rect.width);
    }
};

Window_DatabaseList.prototype.refresh = function() {
    var npcs = $gameSystem.databaseData()['npc'] || {};
    var locations = $gameSystem.databaseData()['location'] || {};
    var clues = $gameSystem.databaseData()['clue'] || {};

    var data = [];
    for (var npcId in npcs) {
        var npcData = npcs[npcId];
        data.push({
            type: 'npc',
            id: npcId,
            name: npcData.name
        });
    }
    for (var locationId in locations) {
        var locationData = locations[locationId];
        data.push({
            type: 'location',
            id: locationId,
            name: locationData.name
        });
    }
    for (var clueId in clues) {
        var clueData = clues[clueId];
        data.push({
            type: 'clue',
            id: clueId,
            name: clueData.name
        });
    }

    this._data = data;
    Window_Selectable.prototype.refresh.call(this);
};

// Define a new window class for displaying the contents of the database/log.
function Window_Database() {
    this.initialize.apply(this, arguments);
}

Window_Database.prototype = Object.create(Window_Selectable.prototype);
Window_Database.prototype.constructor = Window_Database;

Window_Database.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._entryType = null;
    this._entryId = null;
    this.refresh();
};

Window_Database.prototype.setListWindow = function(listWindow) {
    this._listWindow = listWindow;
};

Window_Database.prototype.setEntry = function(entryType, entryId) {
    if (this._entryType !== entryType || this._entryId !== entryId) {
        this._entryType = entryType;
        this._entryId = entryId;
        this.refresh();
    }
};

Window_Database.prototype.processCancel = function() {
    Window_Selectable.prototype.processCancel.call(this);
    this.callHandler('cancel');
};


Window_Database.prototype.refresh = function() {
    this.contents.clear();

    if (this._entryType && this._entryId) {
        var databaseData = $gameSystem.databaseData()[this._entryType] || {};
        var entryData = databaseData[this._entryId];

        if (entryData) {
            var lineHeight = this.lineHeight();
            var x = 0;
            var y = 0;
            var maxWidth = this.contents.width - this.itemPadding() * 2;

            // Draw entry name.
            this.drawText(entryData.name, x, y, maxWidth);
            y += lineHeight;

            // Draw entry image.
            if (entryData.image) {
                this.drawIcon(entryData.image, x, y);
                y += Window_Base._iconHeight + 4;
            }

            // Draw entry description.
            this.drawTextEx(entryData.description, x, y, maxWidth);
            y += lineHeight * 2;
        }
    }
};

// Save and load data about NPCs, descriptions, locations, dialogues,
// and clues as the player progresses through the game.
var _DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    var contents = _DataManager_makeSaveContents.call(this);
    contents.databaseData = $gameSystem.databaseData();
    return contents;
};

var _DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    _DataManager_extractSaveContents.call(this, contents);
    $gameSystem.setDatabaseData(contents.databaseData);
};

// Define methods for storing and retrieving data from the $gameSystem object.
Game_System.prototype.databaseData = function() {
    if (!this._databaseData) {
        this._databaseData = {};
    }
    return this._databaseData;
};

Game_System.prototype.setDatabaseData = function(databaseData) {
    this._databaseData = databaseData;
};

Game_System.prototype.addDatabaseEntry = function(entryType, entryId, entryData) {
    var databaseData = this.databaseData();
    if (!databaseData[entryType]) {
        databaseData[entryType] = {};
    }
    databaseData[entryType][entryId] = JSON.parse(entryData);
};

PluginManager.registerCommand('eBookTest', 'AddDatabaseEntry', args => {
    var entryType = String(args.entryType);
    var entryId = Number(args.entryId);
    var entryData = args.entryData;
    $gameSystem.addDatabaseEntry(entryType, entryId, entryData);
});