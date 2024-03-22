sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    "./BaseController"

], function(Controller, JSONModel, ODataModel, Filter, FilterOperator,Spreadsheet,exportLibrary,BaseController) {
    "use strict";

    return Controller.extend("sap.btp.esodata.controller.View2", {
        onInit: function() {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Dettagli").attachPatternMatched(this.onRouteMatched, this);

            var oView = this.getView();
            oView.setModel(new JSONModel(), "modOrderDetails");
        },

        onRouteMatched: async function(oEvent){
            const oModel = new ODataModel("/V2/Northwind/Northwind.svc/");

            var oTable = this.getView().byId("detailsTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            var sOrderDetailsID = oEvent.getParameter("arguments").orderID //ho visto com'è fatto l'oEvent da console: un oggetto con tutti i parametri che gli passo

            if (sOrderDetailsID) {
                var oFilter = new Filter("OrderID", FilterOperator.EQ, sOrderDetailsID);
                aFilters.push(oFilter);
            }

            const oData = await new Promise((resolve, reject) => {
                oModel.read("/Order_Details", {
                    filters: aFilters,
                    success: function(oData, response) {
                        resolve(oData);
                    },
                    error: function(error) {
                        reject(error);
                    }
                })
            });
            this.getView().getModel("modOrderDetails").setData(oData.results);
        
            oBinding.filter(aFilters);
        },

        navigateHomepage: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteView1");
        }
    });
});
