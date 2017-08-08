var config = {
  apiKey: "AIzaSyCU1DcyCq1p8CHutmQ1Ao-f6izMQFoL9hI",
  authDomain: "rock-paper-scissors-fc667.firebaseapp.com",
  databaseURL: "https://rock-paper-scissors-fc667.firebaseio.com",
  projectId: "rock-paper-scissors-fc667",
  storageBucket: "",
  messagingSenderId: "102340478271"
};

firebase.initializeApp(config);

$(document).ready(function() {

/**
   _____                            _____        _    _    _                    
  / ____|                          / ____|      | |  | |  (_)                   
 | |  __   __ _  _ __ ___    ___  | (___    ___ | |_ | |_  _  _ __    __ _  ___ 
 | | |_ | / _` || '_ ` _ \  / _ \  \___ \  / _ \| __|| __|| || '_ \  / _` |/ __|
 | |__| || (_| || | | | | ||  __/  ____) ||  __/| |_ | |_ | || | | || (_| |\__ \
  \_____| \__,_||_| |_| |_| \___| |_____/  \___| \__| \__||_||_| |_| \__, ||___/
                                                                      __/ |     
                                                                     |___/      
**/

  var numAvatars = 6;
  var charName = "";
  var oppName = "";
  var myAvatar = "";
  var mySide = "none";
  var oppSide = "";
  var game = ["rock", "paper", "scissors"];

  var latestChat = [];
  var myWins = 0;
  var myLosses = 0;
  var clickSide = "";
  var clickAction = "";
  var oppAction = false;
  
  var database = firebase.database();

  for(var i=1; i<=numAvatars; i++) {
    var newDiv = $("<div>");
    newDiv.addClass("col-xs-2")
    var newImg = $("<img>");
    newImg.addClass("avatar");
    newImg.attr("value", i);
    newImg.attr("src", "assets/images/avatar" + i + ".jpg");
    newDiv.html(newImg);
    $("#avatar-options").append(newDiv);
  }

  $(document).on("click", ".avatar", function() {
    charName = $("#char-name").val().trim();
    if(charName != "") {
      $("#start-screen").css("visibility", "hidden");
      myAvatar = $(this).attr("value")
    } else {
      $("#start-comment").html("<h1>Please enter name</h1>")
    }
    $("#chat-area").empty();
    $("#current-player").text(charName);
  });

  $(document).on("click", ".sit-down", function() {
    console.log(mySide);
    if(mySide === "none") {
      mySide = $(this).attr("value");
      if (mySide === "left") {oppSide="right";} else if (mySide === "right") {oppSide="left";}
      placeAvatar(myAvatar, mySide);
      updateFirebase(mySide);
      database.ref(mySide).onDisconnect().set({
        sitting: false,
        name: "",
        wins: 0,
        losses: 0,
        avatar: "",
        action: ""
      });
    }
  });

  database.ref("left").on("value", function(snapshot) {
    checkPlayer("left", snapshot);
  });  

  database.ref("right").on("value", function(snapshot) {
    checkPlayer("right", snapshot);
  }); 

  function checkPlayer(side, ss) {
    if(ss.val().name != charName) {
      if (ss.val().sitting) {
        var newImg = $("<img>");
        newImg.addClass("avatar-image");
        newImg.attr("src", "assets/images/avatar" + ss.val().avatar + ".jpg");
        $("#avatar-side-" + side).html(newImg);
        oppName = ss.val().name;
        $("#" + side + "-name").text(oppName);
        $("#button-place-" + side).html("");
        $("#scoreboard-" + side).text("Wins: " + ss.val().wins + " || Losses: " + ss.val().losses)
        oppAction = ss.val().action;
        if(oppAction!=null) {checkWin(oppAction);}
      } else {
        var newButton = $("<button>");
        newButton.addClass("sit-down btn btn-default");
        newButton.attr("value", side);
        newButton.text("Sit Here");
        $("#avatar-side-" + side).html("");
        $("#" + side + "-name").text("");
        $("#scoreboard-" + side).text("");
        $("#button-place-" + side).html(newButton);
        oppName = "";
      }
    }
  }

  function placeAvatar(avatarNumber, area) {
    var avatarSide = $("<div>")
    var buttonSide = $("<div>")
    var newButton = $("<button>");
    newButton.text("Get Up");
    newButton.attr("value", area)
    newButton.addClass("get-up btn btn-default");
    var newImg = $("<img>");
    newImg.addClass("avatar-image");
    newImg.attr("src", "assets/images/avatar" + avatarNumber + ".jpg");
    avatarSide.html(newImg)
    $("#avatar-side-" + area).html(avatarSide);
    $("#" + area + "-name").text($("#char-name").val().trim());
    $("#button-place-" + area).html(newButton);

    formatButton(buttonSide, "rock", area);
    formatButton(buttonSide, "paper", area);
    formatButton(buttonSide, "scissors", area);
    $("#button-side-" + area).html(buttonSide);
  }

  function formatButton(buttonArea, action, side) {
    var newButton = $("<button>")
    newButton.addClass("btn btn-default move")
    newButton.attr("value", action)
    newButton.attr("side", side)
    newButton.text(action);    
    buttonArea.append(newButton);
  }

  $(document).on("click", ".move", function() {
    if (clickAction === "") {
      clickSide = $(this).attr("side");
      clickAction = $(this).attr("value");
      var newImg = $("<img>")
      newImg.addClass("action-image")
      newImg.attr("src", "assets/images/" + clickAction + ".jpg");
      console.log("assets/images/" + clickAction + ".jpg");
      $("#button-side-" + clickSide).append(newImg);
      updateFirebase(clickSide);
      checkWin();
    }
  })

  function updateFirebase(side) {
    database.ref(side).set({
      sitting: true,
      name: charName,
      wins: myWins,
      losses: myLosses,
      avatar: myAvatar,
      action: clickAction
    });
  }

  function checkWin() {
    if (clickAction!="" && oppAction) {
      var newImg = $("<img>");
      newImg.attr("src", "assets/images/" + oppAction + ".jpg");
      newImg.addClass("action-image");
      var newDiv = $("<div>");
      newDiv.addClass("result-text");
      $("#button-side-" + oppSide).html(newImg);
      if (clickAction === oppAction) {
        newDiv.text("That is a tie");
      } else if (clickAction === "rock") {
        if (oppAction === "scissors") {
          newDiv.text("You win! " + clickAction + " beats " + oppAction);
          myWins++;
        } else {
          newDiv.text("You lose! " + oppAction + " beats " + clickAction);
          myLosses++;
        }
      } else if (clickAction === "paper") {
        if (oppAction === "rock") {
          newDiv.text("You win! " + clickAction + " beats " + oppAction);
          myWins++;
        } else {
          newDiv.text("You lose! " + oppAction + " beats " + clickAction);
          myLosses++;
        }       
      } else {
        if (oppAction === "paper") {
          newDiv.text("You win! " + clickAction + " beats " + oppAction);
          myWins++;
        } else {
          myLosses++;
          newDiv.text("You lose! " + oppAction + " beats " + clickAction);
        }
      }
      $("#chat-area").append(newDiv)
      $("#chat-area").scrollTop($("#chat-area")[0].scrollHeight);
      $("#scoreboard-" + mySide).text("Wins: " + myWins + " || Losses: " + myLosses)
      updateFirebase(mySide);
      resetGame();
    }
  }

  function resetGame() {
    clickAction = "";
    setTimeout(function() {
      oppAction = false;
      var newButtons = $("<div>")
      formatButton(newButtons, "rock", mySide);
      formatButton(newButtons, "paper", mySide);
      formatButton(newButtons, "scissors", mySide);
      $("#button-side-" + mySide).html(newButtons);
      $("#button-side-" + oppSide).text("");
      updateFirebase(mySide);
    }, 1500);
  }

  $(document).on("click", ".get-up", function() {
    var area = $(this).attr("value")
    database.ref(area).set({
      sitting: false,
      name: "xxxxxxxxxxxxxxx",
      wins: 0,
      losses: 0,
      avatar: "",
      action: ""
    });
    var newButton = $("<button>");
    newButton.addClass("sit-down btn btn-default");
    newButton.attr("value", area);
    newButton.text("Sit Here");
    $("#avatar-side-" + area).html("");
    $("#button-side-" + area).html("");
    $("#" + area + "-name").text("");
    $("#button-place-" + area).html(newButton);
    mySide = "none";
    myWins = 0;
    myLosses = 0;
  });

/**
   _____  _             _      _____        _    _    _                    
  / ____|| |           | |    / ____|      | |  | |  (_)                   
 | |     | |__    __ _ | |_  | (___    ___ | |_ | |_  _  _ __    __ _  ___ 
 | |     | '_ \  / _` || __|  \___ \  / _ \| __|| __|| || '_ \  / _` |/ __|
 | |____ | | | || (_| || |_   ____) ||  __/| |_ | |_ | || | | || (_| |\__ \
  \_____||_| |_| \__,_| \__| |_____/  \___| \__| \__||_||_| |_| \__, ||___/
                                                                 __/ |     
                                                                |___/ 
**/

  database.ref("chat").on("value", function(snapshot) {
      latestChat = snapshot.val().latestChat;
      if (latestChat[0]!="firebase-loading-text-value-changer" && latestChat[0] != "") {
        var newDiv = $("<div>");
        newDiv.text(latestChat[0] + ": " + latestChat[1]);
        $("#chat-area").append(newDiv);
        $("#chat-area").scrollTop($("#chat-area")[0].scrollHeight);
      }
  }, function(errorObject) {
    console.log(errorObject);
  });

  $("#submit-chat").on("click", function() {
    event.preventDefault();
    var chatText = $("#chat-text").val().trim();
    if(chatText != "") {
      database.ref("chat").set({
        latestChat: ["firebase-loading-text-value-changer"]
      });
      database.ref("chat").set({
        latestChat: [charName, chatText]
      });
    }
    $("#chat-text").val("");
  })

});