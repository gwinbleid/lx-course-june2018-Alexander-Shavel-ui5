sap.ui.define([
    "sap/xander/shavel/app/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, MessageToast, MessageBox, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("sap.xander.shavel.app.controller.Orders", {

        /**
         * Controller's "init" lifecycle method.
         */
        onInit: function () {

            var oOrdersCountsModel = new JSONModel({
                all: 0,
                pending: 0,
                accepted: 0
            });

            this.oOrdersCountsModel = oOrdersCountsModel;
            this.getView().setModel(oOrdersCountsModel, "ordersCount");

            //model to store filters
            var oFiltersModel = new JSONModel({
                pending: [new Filter("summary/status", FilterOperator.EQ, "'Pending'")],
                accepted: [new Filter("summary/status", FilterOperator.EQ, "'Accepted'")],
                all: []
            });

            this.oFiltersModel = oFiltersModel;
            this.getView().setModel(oFiltersModel, "filtersModel");
        },

        /**
         * "After rendering" ifecycle method of View.
         */
        onAfterRendering: function () {
            this.countOrderItems();
        },

        /**
         * Counts number of orders with defferent criteria
         */
        countOrderItems: function () {
            var that = this;

            this.getView().getModel("odata").read("/Orders/$count", {
                success: function (oData) {
                    that.oOrdersCountsModel.setProperty("/all", oData);
                }
            });

            this.getView().getModel("odata").read("/Orders/$count", {
                success: function (oData) {
                    that.oOrdersCountsModel.setProperty("/pending", oData);
                },
                filters: this.oFiltersModel.getProperty("/pending")
            });

            this.getView().getModel("odata").read("/Orders/$count", {
                success: function(oData){
                    that.oOrdersCountsModel.setProperty("/accepted", oData);
                },
                filters: this.oFiltersModel.getProperty("/accepted")
            });
        },

        /**
         * "Press" event handler of the  "Add Order" button.
         *
         */
        onOpenDialogPress: function () {
            var oView = this.getView();

            var oODataModel = oView.getModel("odata");

            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment(oView.getId(), "sap.xander.shavel.app.view.fragments.OrderCreateDialog", this);
                oView.addDependent(this.oDialog);
            }

            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "MMM d, yyyy"
            });

            var oNow = new Date();

            // call "createEntry" method to
            // 1. create a context based on the entity type
            // 2. add the "create" request to the request queue
            var oEntryCtx = oODataModel.createEntry("/Orders", {
                properties: {
                    summary: {
                        totalPrice: 0,
                        createdAt: oDateFormat.format(oNow)
                    },
                    shipTo: {
                        name: "",
                        address: "",
                        ZIP: "",
                        region: "",
                        country: ""
                    },
                    customerInfo: {
                        firstName: "",
                        lastName: "",
                        address: "",
                        phone: "",
                        email: ""
                    },
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
         * "Press" event handler of the modal's "Create" button.
         *
         */
        onDialogCreatePress: function () {
            var oODataModel = this.getView().getModel("odata");

            // call the method to "release" the changes from queue
            oODataModel.submitChanges();

            this.countOrderItems();

            this.oDialog.close();
        },

        /**
         * "Press" event handler of the modal's "Cancel" button.
         *
         */
        onCancelPress: function () {
            var oODataModel = this.getView().getModel("odata");

            var oCtx = this.oDialog.getBindingContext("odata");

            // delete the entry from requests queue
            oODataModel.deleteCreatedEntry(oCtx);

            this.oDialog.close();
        },

        /**
         * "Press" event handler of the "ColumnListItem".
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        onOrderItemPressed: function(oEvent){
            var oItem, oCtx, oPath;

            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext("odata");

            this.getRouter().navTo("orderItem",{
                orderId : oCtx.getProperty("id")
            });

        },

        /**
         * "Delete" event handler of the "ColumnListItem".
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        onDeleteOrderPress: function (oEvent) {
            var that = this;

            var oCtx = oEvent.getParameter("listItem").getBindingContext("odata");

            var oODataModel = oCtx.getModel();

            var sKey = oODataModel.createKey("/Orders", oCtx.getObject());

            // execute "delete" request of the entity, specified in a key
            oODataModel.remove(sKey, {
                success: function () {
                    MessageToast.show("Order was successfully removed!");
                    that.countOrderItems();
                },
                error: function () {
                    MessageBox.error("Error while removing supplier!");
                }
            });
        },

        /**
         * "Select" event handler of the "IconTabBar".
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        onQuickFilter: function(oEvent) {
            var oItemsBinding = this.getView().byId("tableOfOrders").getBinding("items"),
                sKey = oEvent.getParameter("key"),
                sPendingKey = "'Pending'",
                sAcceptedKey = "'Accepted'",
                oFilter;

            if (sKey === sPendingKey) {
                oFilter = new Filter("summary/status", FilterOperator.EQ,sPendingKey);
                oItemsBinding.filter(oFilter);
            } else if (sKey === sAcceptedKey) {
                oFilter = new Filter("summary/status", FilterOperator.EQ,sAcceptedKey);
                oItemsBinding.filter(oFilter);
            } else {
                oItemsBinding.filter([]);
            }
        }
    });
});
