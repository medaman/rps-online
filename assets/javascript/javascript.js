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

  var numAvatars = 6;
  var charName;
  var myAvatar;
  var mySide = "none";

  var latestChat = [];
  var numGames = 0;
  
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
  });

  $(document).on("click", ".side", function() {
    mySide = $(this).attr("value");
    placeAvatar(myAvatar, mySide);
    database.ref(mySide).set([true, charName, myAvatar]);
    database.ref(mySide).onDisconnect().set([false])

  });

  database.ref("left").on("value", function(snapshot) {
    checkPlayer("left", snapshot);
  });  

  database.ref("right").on("value", function(snapshot) {
    checkPlayer("right", snapshot);
  }); 

  function checkPlayer(side, ss) {
    if(ss.val()[1] != charName) {
      if (ss.val()[0]) {
      var newImg = $("<img>");
      newImg.attr("src", "assets/images/avatar" + ss.val()[2] + ".jpg");
      $("#" + side + "-avatar").html(newImg);
      $("#" + side + "-name").text(ss.val()[1]);
      } else {
        console.log("HWAT? ")
        var newButton = $("<button>");
        newButton.addClass("side");
        newButton.attr("value", side);
        newButton.text("Sit Here");
        $("#" + side + "-avatar").html("");
        $("#" + side + "-name").text("");
        $("#" + side + "-name").append(newButton);
      }
    }
  }

  $(document).on("click", ".get-up", function() {
    var area = $(this).attr("value")
    database.ref(area).set([false,"xxxxxx"]);
    var newButton = $("<button>");
    newButton.addClass("side");
    newButton.attr("value", area);
    newButton.text("Sit Here");
    $("#" + area + "-avatar").html("");
    $("#" + area + "-name").text("");
    $("#" + area + "-name").append(newButton);
    mySide = "none";
  });

  function placeAvatar(avatarNumber, area) {
    var newButton = $("<button>");
    newButton.text("Get Up");
    newButton.attr("value", area)
    newButton.addClass("get-up");
    var newImg = $("<img>");
    newImg.attr("src", "assets/images/avatar" + avatarNumber + ".jpg");
    $("#" + area + "-avatar").html(newImg);
    $("#" + area + "-name").text($("#char-name").val().trim());
    $("#" + area + "-name").append(newButton);
  }

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