import RNMessageChannel from "./react-native-webview-messaging";
const dropin = require("braintree-web-drop-in");

const submitButton = document.querySelector("#submit-button");
let clientToken = "";
const goBackButton = document.querySelector("#go-back-button");
const noticeBox = document.querySelector("#notice-box");
const loader = document.querySelector("#loader");

RNMessageChannel.on("tokenReceived", event => {
  clientToken = event.payload.clientToken;

  if (event.payload.options.creditCard) {
    createCreditCardUI(clientToken);
  }
  if (event.payload.options.paypal) {
    createPaypalUI(clientToken);
  }
});

const createPaypalUI = clientToken => {
  console.log("Not implmented");
};

const createCreditCardUI = clientToken => {
  dropin
    .create({
      authorization: clientToken,
      container: "#dropin-container"
    })
    .then(instance => {
      //alert(`instance: ${instance}`);
      submitButton.addEventListener("click", function() {
        instance.requestPaymentMethod(function(err, response) {
          if (err) {
            RNMessageChannel.emit("nonceObtained", {
              payload: {
                type: "error",
                err
              }
            });
          } else {
            // Submit payload.nonce to your server
            RNMessageChannel.emit("nonceObtained", {
              payload: {
                type: "success",
                response
              }
            });
          }
        });
      });
    })
    .catch(function(err) {
      // Handle any errors that might've occurred when creating Drop-in
      RNMessageChannel.sendJSON({
        type: "error",
        err
      });
    });
};

RNMessageChannel.on("purchasing", event => {
  submitButton.style.display = "none";
  noticeBox.style.display = "inline";
  loader.style.display = "inline";
  noticeBox.innerHTML = "Making Purchase";
});

RNMessageChannel.on("purchaseSuccess", event => {
  goBackButton.style.display = "inline";
  loader.style.display = "none";
  noticeBox.innerHTML = "Thank You For Your Purchase";
});

RNMessageChannel.on("purchaseFailure", event => {
  goBackButton.style.display = "inline";
  loader.style.display = "none";
  noticeBox.innerHTML = `Purchase Error ${event.payload}`;
});

goBackButton.addEventListener("click", function() {
  RNMessageChannel.emit("goBack");
});