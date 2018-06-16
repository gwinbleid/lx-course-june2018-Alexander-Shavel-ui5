sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller, History) {
    "use strict";

    return Controller.extend("leverx.app.controller.SecondPage", {
        onToProduct: function () {
            this.getOwnerComponent().getRouter().navTo("ThirdPage");
        },

        onNavBack : function () {
            var sPreviousHash = History.getInstance().getPreviousHash();

            //The history contains a previous entry
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                // There is no history!
                // replace the current hash with page 1 (will not add an history entry)
                this.getOwnerComponent().getRouter().navTo("", null, true);
            }
        }
    });
});
