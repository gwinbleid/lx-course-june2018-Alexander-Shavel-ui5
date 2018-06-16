sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, MessageToast, History) {
    "use strict";

    return Controller.extend("leverx.app.controller.ThirdPage", {
        onNavBack : function () {
            var sPreviousHash = History.getInstance().getPreviousHash();

            //The history contains a previous entry
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                // There is no history!
                // replace the current hash with page 1 (will not add an history entry)
                this.getOwnerComponent().getRouter().navTo("order", null, true);
            }
        }
    });
});
