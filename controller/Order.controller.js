sap.ui.define([
    "sap/xander/shavel/app/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/HashChanger"
], function (BaseController, JSONModel, History, MessageToast, MessageBox, HashChanger) {
    "use strict";

    return BaseController.extend("sap.xander.shavel.app.controller.Order", {

        /**
         * Controller's "init" lifecycle method.
         */
        onInit: function() {
            // create AppView JSON model
            this.oAppViewModel = new JSONModel({
                editShipData: false,
                editCustomData: false,
                enableShipInput: false,
                enableCustomInput: false
            });

            this.getView().setModel(this.oAppViewModel, "appView");

            var oComponent = this.getOwnerComponent();
            var oRouter = oComponent.getRouter();

            oRouter.getRoute("orderItem").attachPatternMatched(this.onPatternMatched, this);
        },

        /**
         * Gets the reference to the router instance.
         *
         * @returns {sap.ui.core.routing.Router} reference to the router instance.
         */
        onPatternMatched: function (oEvent) {
            var that = this;

            var mRouteArguments = oEvent.getParameter("arguments");

            var sOrderID = mRouteArguments.orderId;

            // get the ODataModel instance form the view (as the model was instantiated and set up in the Component,
            // the view has automatically access for it)

            var oODataModel = this.getView().getModel("odata");

            // wait until the metadata has been loaded. "metadataLoaded" method returns a promise
            oODataModel.metadataLoaded().then(function () {
                // create an existent entity key, in order to be able to bind the view to it
                // this method takes the name of EntitySet (collection) and map of key parameters
                var sKey = oODataModel.createKey("/Orders", {id: sOrderID});

                // bind the whole view to order key (ODataModel will automatically request the data)

                that.getView().bindObject({
                    path: sKey,
                    model: "odata"
                });
            });
        },

        /**
         * "Press" event handler of the "Edit Ship data" for editing ship data
         */
        onEditShipDataPress: function() {
            this.oAppViewModel.setProperty("/editShipData", true);
            this.oAppViewModel.setProperty("/enableShipInput", true);
        },

        /**
         * "Press" event handler of the "Edit Customer" for enable cusotmer data update
         */
        onEditCustomerDataPress: function() {
            this.oAppViewModel.setProperty("/editCustomData", true);
            this.oAppViewModel.setProperty("/enableCustomInput", true);
        },

        /**
         * "Press" event handler of the "Save Ship" for saving ship info
         */
        onSaveShipDataPress: function () {
            this.oAppViewModel.setProperty("/editShipData", false);
            this.oAppViewModel.setProperty("/enableShipInput", false);

            var oODataModel = this.getView().getModel("odata");

            // call the method to release the request queue
            oODataModel.submitChanges();
        },

        /**
         * "Press" event handler of the "Button" for saving customer info
         */
        onSaveCustomerDataPress: function () {
            this.oAppViewModel.setProperty("/editCustomData", false);
            this.oAppViewModel.setProperty("/enableCustomInput", false);

            var oODataModel = this.getView().getModel("odata");

            // call the method to release the request queue
            oODataModel.submitChanges();
        },

        /**
         * "Press" event handler of the "Button" for cancel ship data input
         */
        onCancelShipDataPress: function () {
            this.oAppViewModel.setProperty("/editShipData", false);
            this.oAppViewModel.setProperty("/enableShipInput", false);

            var oODataModel = this.getView().getModel("odata");

            // call the method to reset the request queue
            oODataModel.resetChanges();
        },

        /**
         * "Press" event handler of the "Button" for cancel customer info input
         */
        onCancelCustomerDataPress: function () {
            this.oAppViewModel.setProperty("/editCustomData", false);
            this.oAppViewModel.setProperty("/enableCustomInput", false);

            var oODataModel = this.getView().getModel("odata");

            // call the method to reset the request queue
            oODataModel.resetChanges();
        },

        /**
         * "Press" event handler of the "Button" for open modal
         */
        onOpenProductDialog: function () {
            var oHashChanger = new HashChanger();
            var sHash = oHashChanger.getHash();
            var aStrings = sHash.split('/');


            var oView = this.getView();

            var oODataModel = oView.getModel("odata");

            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment(oView.getId(), "sap.xander.shavel.app.view.fragments.ProductCreateDialog", this);

                oView.addDependent(this.oDialog);
            }

            // call "createEntry" method to
            // 1. create a context based on the entity type
            // 2. add the "create" request to the request queue

            var oEntryCtx = oODataModel.createEntry("/OrderProducts", {
                properties: {
                    orderId: aStrings[2]
                }
            });

            // set context to the dialog
            this.oDialog.setBindingContext(oEntryCtx);

            // set default model to allow relative binding without a need to specify model's name
            this.oDialog.setModel(oODataModel);

            // open the dialog
            this.oDialog.open();

        },

        /**
         * "Press" event handler of the "Button" for cancel creaate product
         */
        onProductDialogCreatePress: function () {
            var oODataModel = this.getView().getModel("odata");

            // call the method to "release" the changes from queue
            oODataModel.submitChanges();

            this.oDialog.close();
        },

        /**
         * "Press" event handler of the "Button" for cancel creaate product
         */
        onCancelPress: function () {
            var oODataModel = this.getView().getModel("odata");

            var oCtx = this.oDialog.getBindingContext("odata");

            // delete the entry from requests queue
            oODataModel.deleteCreatedEntry(oCtx);

            this.oDialog.close();
        },

        /**
         * "Delete" event handler of the "Table".
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        onDeleteProductPress: function (oEvent) {

            var oCtx = oEvent.getParameter("listItem").getBindingContext("odata");

            var oODataModel = oCtx.getModel();

            var sKey = oODataModel.createKey("/OrderProducts", oCtx.getObject());

            // execute "delete" request of the entity, specified in a key
            oODataModel.remove(sKey, {
                success: function () {
                    MessageToast.show("Product was successfully removed!");
                },
                error: function () {
                    MessageBox.error("Error while removing supplier!");
                }
            });
        },

        /**
         * "navTo" event for "ColumnListItems"
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        onProductItemNavigate: function (oEvent) {
            var oItem, oCtx;

            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext("odata");

            this.getRouter().navTo("productItem",{
                orderId: jQuery.sap.getUriParameters().get("orderId"),
                productId : oCtx.getProperty("id")
            });
        }

    });
});
