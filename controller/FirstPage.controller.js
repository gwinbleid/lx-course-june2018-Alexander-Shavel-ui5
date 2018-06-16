sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("leverx.app.controller.FirstPage", {
        onToOrder: function () {
            this.getOwnerComponent().getRouter().navTo("SecondPage");
        }
    });
});
