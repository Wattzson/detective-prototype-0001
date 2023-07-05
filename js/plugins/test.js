/*:
 * @target MZ
 * @plugindesc Database - A custom plugin that creates a database or log for the player to access during the game.
 * @author Daniel
 *
 * @param Menu Command
 * @text Menu Command
 * @desc The name of the menu command that opens the database or log.
 * @default Database
 *
 * @param Database Title
 * @text Database Title
 * @desc The title of the database or log window.
 * @default Database
 *
 * @param Database Categories
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
  console.log('The basic plugin has been loaded and run!');
})();