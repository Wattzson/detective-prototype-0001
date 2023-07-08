/*:
 * @target MZ
 * @plugindesc Database A custom plugin that creates a database or log for the player to access during the game.
 * @author Daniel
 *
 * @param menuCommand
 * @text Menu Command
 * @desc The name of the menu command that opens the database or log.
 * @default Database
 *
 * @param databaseTitle
 * @text Database Title
 * @desc The title of the database or log window.
 * @default Database
 *
 * @param databaseCategories
 * @text Database Categories
 * @desc The categories of the database or log, separated by commas.
 * @default NPCs, Locations, Clues, Dialogue
 *
 * @help
 * This is a custom plugin that creates a database or log for the player to access during the game.
 * The plugin adds a new menu command that opens a window with different categories of data that the player has discovered while playing.
 * The plugin also provides some plugin commands and script calls to add, remove, or check data in the database or log.
 *
 * Plugin Commands:
 *
 * AddData category name description image
 * - Adds a new data entry to the specified category with the given name, description, and image.
 * - The category must be one of the categories defined in the plugin parameters.
 * - The name and description are strings that can contain text codes.
 * - The image is the filename of an image file in the img/pictures folder.
 * Example: AddData NPCs "Assistant" "Our young genius Assistant" assistant.png
 *
 * RemoveData category name
 * - Removes an existing data entry from the specified category with the given name.
 * - The category and name must match an existing data entry in the database or log.
 *
 * ClearData category
 * - Clears all data entries from the specified category.
 * - The category must be one of the categories defined in the plugin parameters.
 *
 * Script Calls:
 *
 * $gameDatabase.hasData(category, name)
 * - Returns true if there is a data entry in the specified category with the given name, false otherwise.
 * 
 *
 * $gameDatabase.addData('NPCs', 'Bob', 'A friendly guy who lives next door.', 'Bob.png');
 * 
 */

(() => {
    console.log('The basic plugin has been loaded and run! -database');

     // Plugin command handlers
    PluginManager.registerCommand('Database', 'AddData', args => {
      const category = String(args.category || '');
      const name = String(args.name || '');
      const description = String(args.description || '');
      const image = String(args.image || '');
      $gameDatabase.addData(category, name, description, image);
    });

    PluginManager.registerCommand('Database', 'RemoveData', args => {
      const category = String(args.category || '');
      const name = String(args.name || '');
      $gameDatabase.removeData(category, name);
    });

    PluginManager.registerCommand('Database', 'ClearData', args => {
      const category = String(args.category || '');
      $gameDatabase.clearData(category);
    }); 
    
    // Plugin parameters
    const parameters = PluginManager.parameters('Database');
    const menuCommand = String(parameters['menuCommand'] || 'Database');
    const databaseTitle = String(parameters['databaseTitle'] || 'Database');
    const databaseCategories = String(parameters['databaseCategories'] || 'NPCs, Locations, Clues, Dialogue').split(',');
  
    // Game_Database class
    class Game_Database {
      constructor() {
        this.clear();
      }
  
      clear() {
        this._data = {};
        for (const category of databaseCategories) {
          this._data[category] = [];
        }
      }
  
      addData(category, name, description, image) {
        if (this._data[category]) {
          this._data[category].push({name, description, image});
        }
      }
  
      removeData(category, name) {
        if (this._data[category]) {
          this._data[category] = this._data[category].filter(data => data.name !== name);
        }
      }
  
      clearData(category) {
        if (this._data[category]) {
          this._data[category] = [];
        }
      }
  
      getData(category) {
        return this._data[category] || [];
      }
  
      hasData(category, name) {
        return this.getData(category).some(data => data.name === name);
      }
    }
  
    // Create $gameDatabase object
    const alias_Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
      alias_Game_System_initialize.apply(this, arguments);
      this._database = this._database || new Game_Database();
    };
  
    Game_System.prototype.createDatabase = function() {
      console.log("Game_System createDatabase");
      this._database = new Game_Database();
    };
  
    Object.defineProperty(window, '$gameDatabase', {
      get: function() {
        return $gameSystem._database;
      },
      configurable: true
    });

  
    // Add menu command
    const _Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function() {
      _Window_MenuCommand_addOriginalCommands.call(this);
      this.addCommand(menuCommand, 'database', true);
    };
  
    const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
      _Scene_Menu_createCommandWindow.call(this);
      this._commandWindow.setHandler('database', this.commandDatabase.bind(this));
    };
  
    Scene_Menu.prototype.commandDatabase = function() {
      SceneManager.push(Scene_Database);
    };
  
    // Scene_Database class
    class Scene_Database extends Scene_MenuBase {
      create() {
        super.create();
        this.createHelpWindow();
        this.createCategoryWindow();
        this.createDataWindow();
      }
  
      createCategoryWindow() {
        const rect = this.categoryWindowRect();
        this._categoryWindow = new Window_DatabaseCategory(rect);
        this._categoryWindow.setHelpWindow(this._helpWindow);
        this._categoryWindow.setHandler('ok', this.onCategoryOk.bind(this));
        this._categoryWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._categoryWindow);
      }
  
      categoryWindowRect() {
        const wx = 0;
        const wy = this.mainAreaTop();
        const ww = Graphics.boxWidth;
        const wh = this.calcWindowHeight(1, true);
        return new Rectangle(wx, wy, ww, wh);
      }
  
      createDataWindow() {
        const rect = this.dataWindowRect();
        this._dataWindow = new Window_DatabaseData(rect);
        this._dataWindow.setHelpWindow(this._helpWindow);
        this._dataWindow.setHandler('cancel', this.onDataCancel.bind(this));
        this._categoryWindow.setDataWindow(this._dataWindow);
        this.addWindow(this._dataWindow);
      }
  
      dataWindowRect() {
        const wx = 0;
        const wy = this._categoryWindow.y + this._categoryWindow.height;
        const ww = Graphics.boxWidth;
        const wh = Graphics.boxHeight - wy;
        return new Rectangle(wx, wy, ww, wh);
      }
  
      onCategoryOk() {
        this._dataWindow.activate();
        this._dataWindow.select(0);
      }
  
      onDataCancel() {
        this._dataWindow.deselect();
        this._categoryWindow.activate();
      }
    }
  
    // Window_DatabaseCategory class
    class Window_DatabaseCategory extends Window_HorzCommand {
      makeCommandList() {
        for (const category of databaseCategories) {
          this.addCommand(category, category);
        }
      }
  
      maxCols() {
        return databaseCategories.length;
      }
  
      update() {
        super.update();
        if (this._dataWindow) {
          this._dataWindow.setCategory(this.currentSymbol());
        }
      }
  
      setDataWindow(dataWindow) {
        this._dataWindow = dataWindow;
        this.update();
      }
    }
  
    // Window_DatabaseData class
    class Window_DatabaseData extends Window_Selectable {
      setCategory(category) {
        if (this._category !== category) {
          this._category = category;
          this.refresh();
          this.scrollTo(0, 0);
        }
      }
    
      maxCols() {
        return 2;
      }
    
      maxItems() {
        return this._data ? this._data.length : 0;
      }
    
      itemHeight() {
        return 96;
      }
    
      item() {
        return this._data ? this._data[this.index()] : null;
      }
    
      makeItemList() {
        this._data = $gameDatabase.getData(this._category);
      }
    
      drawItem(index) {
        const item = this._data[index];
        const rect = this.itemLineRect(index);
        const nameWidth = rect.width - 104;
        this.changePaintOpacity(true);
        this.drawPicture(item.image, rect.x + 2, rect.y + 2, 100, 92);
        this.drawText(item.name, rect.x + 104, rect.y, nameWidth);
        this.drawTextEx(item.description, rect.x + 104, rect.y + this.lineHeight(), nameWidth);
      }
    
      drawPicture(filename, x, y, width, height) {
        const bitmap = ImageManager.loadPicture(filename);
        const pw = bitmap.width;
        const ph = bitmap.height;
        const sx = 0;
        const sy = 0;
        this.contents.blt(bitmap, sx, sy, pw, ph, x, y, width, height);
      }
    
      updateHelp() {
        this.setHelpWindowItem(this.item());
      }
    }

});