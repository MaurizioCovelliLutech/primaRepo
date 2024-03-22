sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library"
     
], function(Controller, JSONModel, ODataModel, Filter, FilterOperator,Spreadsheet,exportLibrary) {
    "use strict";
   
    return Controller.extend("my.application.controller.BaseController", {

        setModel: function(oModel, sName) {
 
            return this.getView().setModel(oModel, sName);
        },

        getSelectedItem: function(oTable,oModel,oObject){
            return this.getView().byId(oTable).getSelectedItem().getBindingContext(oModel).getObject().oObject;
        }

    })
})  