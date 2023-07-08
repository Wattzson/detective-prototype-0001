// test.js

(function() {
  // Define your plugin command to open the database or log
  PluginManager.registerCommand("test", "OpenDatabase", function() {
    // Code to open the database or log window
  });

  // Define a function to store and retrieve data
  function CustomDatabase() {
    // Define variables and arrays to store the data
    var npcData = {};
    var dialogueData = {};

    // Function to store NPC data
    this.storeNPCData = function(npcId, npcName, npcDescription, npcImage) {
      npcData[npcId] = {
        name: npcName,
        description: npcDescription,
        image: npcImage
      };
    };

    // Function to store dialogue data
    this.storeDialogueData = function(npcId, dialogueId, dialogueText) {
      if (!dialogueData[npcId]) {
        dialogueData[npcId] = {};
      }
      dialogueData[npcId][dialogueId] = dialogueText;
    };

    // Function to retrieve NPC data
    this.getNPCData = function(npcId) {
      return npcData[npcId];
    };

    // Function to retrieve dialogue data
    this.getDialogueData = function(npcId, dialogueId) {
      return dialogueData[npcId] && dialogueData[npcId][dialogueId];
    };
  }

  // Create an instance of the CustomDatabase
  var customDatabase = new CustomDatabase();

  // Expose the CustomDatabase instance to the global scope for access in other parts of the game
  window.CustomDatabase = customDatabase;
})();
