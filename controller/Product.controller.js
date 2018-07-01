sap.ui.define([
    "sap/xander/shavel/app/controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "sap/ui/core/routing/HashChanger"
], function (BaseController, MessageToast, History, HashChanger) {
    "use strict";

    return BaseController.extend("leverx.app.controller.Product", {

        /**
         * Controller's "init" lifecycle method.
         */
        onInit: function() {
            var oComponent = this.getOwnerComponent();
            var oRouter = oComponent.getRouter();

            oRouter.getRoute("productItem").attachPatternMatched(this.onPatternMatched, this);
        },

        /**
         * "ProductDetails" route pattern matched event handler.
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        onPatternMatched: function (oEvent) {
            var that = this;

            var mRouteArguments = oEvent.getParameter("arguments");
            var sProductID = mRouteArguments.productId;

            // get the ODataModel instance from the view (as the model was instantied and set up in the Component,
            // the view has automatically access for it)

            var oODataModel = this.getView().getModel("odata");

            // wait until the metadata has been loaded. "metadataLoaded" method returns a promise
            oODataModel.metadataLoaded().then(function () {
                // create an existent entity key, in order to be able to bind the view to it
                // this method takes the name of EntitySet (collection) and map of key parameters
                var sKey = oODataModel.createKey("/OrderProducts", {id: sProductID});

                // bind the whole view to order key (ODataModel will automatically request the data)

                that.getView().bindObject({
                    path: sKey,
                    model: "odata"
                });
            });
        },

        /**
         * "Post" event handler of the "FeedInput".
         */
        onComment: function (oEvent) {
            var oHashChanger = new HashChanger();
            var sHash = oHashChanger.getHash();
            var aStrings = sHash.split('/');

            var oView = this.getView();
            var oODataModel = oView.getModel("odata");

            var sAuthor = this.oView.byId("authorName").getValue();
            var nRating = this.oView.byId("RI_M").getValue();
            var sComment = oEvent.getParameter("value");

            var oEntryCtx = oODataModel.createEntry("/ProductComments", {
                properties: {
                    comment: sComment,
                    productId: aStrings[2],
                    author: sAuthor,
                    rating: nRating,
                    createdDate: new Date,
                    id: parseInt((new Date).getTime() / 1000)
                }
            });

            oODataModel.submitChanges();
        }
    });
});
