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

    var EdmType = exportLibrary.EdmType;
    const sURL = "/V2/Northwind/Northwind.svc/";

    return Controller.extend("sap.btp.esodata.controller.View1", {
        onInit: function() {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteView1").attachPatternMatched(this.onRouteMatched, this);

            var oView = this.getView();
            oView.setModel(new JSONModel(), "modOrder");

            var oDynamicPage = this.byId("dynamicPageId");
           // oDynamicPage.setTitle(new sap.m.Title({ text: "My Dynamic Page" }));

            this.oFilterBar = this.getView().byId("filterBarId");

            //this.byId("orderDateInputId").setMaxDate(new Date('1997-12-31'));

        },


        createColumnConfig: function() { //in questa funzione vado a creare le colonne 
			var aCols = [];

			aCols.push({
				label: "OrderID",
				//type: EdmType.String,
                property: "OrderID",
				//template: '{0}, {1}'
			});

			aCols.push({
				label: 'CustomerID',
				//type: EdmType.Number,
				property: 'CustomerID',
				scale: 0
			});

            aCols.push({
				label: 'OrderDate',
				//type: EdmType.String,
                property: "OrderDate",
			});

            aCols.push({
				label: 'ShipAddress',
				//type: EdmType.String,
                property: "ShipAddress",
			});
            
            aCols.push({
				label: 'ShipCity',
				//type: EdmType.String,
                property: "ShipCity",
			});
            return aCols;

        },

        onRouteMatched: async function(oEvent) {
            var orderID = oEvent.getParameter("arguments").orderID;
            var oModel = new ODataModel("/V2/Northwind/Northwind.svc/");
        
            await oModel.metadataLoaded();
        
            const oData = await new Promise((resolve, reject) => {
                oModel.read("/Orders", {
                    filters: [new sap.ui.model.Filter("OrderID", sap.ui.model.FilterOperator.EQ, orderID)],
                    success: function(oData, response) {
                        resolve(oData);
                    },
                    error: function(error) {
                        reject(error);
                    }
                });
            });

            
            //this.getView().setModel(new JSONModel(), "modOrder")).setData(oData.results);
        
        },

        formatDate: function(date){
            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:"yyyy-MM-dd"});
            return oDateFormat.format(date);
        },
        
        chiamataOData: function() {
            this.onRouteMatched();  
        },

        onSearch: async function (oEvent) {
            var oTable = this.getView().byId("exportTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            var sCustomerId = oEvent.getParameter("selectionSet")[0].getValue();
        
            if (sCustomerId) {
                var oFilter = new Filter("CustomerID", FilterOperator.EQ, sCustomerId);
                aFilters.push(oFilter);
            }

            var oModel = new ODataModel("/V2/Northwind/Northwind.svc/");

            const oData = await new Promise((resolve, reject) => {
                oModel.read("/Orders", {
                    filters: aFilters,
                    success: function(oData, response) {
                        resolve(oData);
                    },
                    error: function(error) {
                        reject(error);
                    }
                });
            });

            this.getView().getModel("modOrder").setData(oData.results);
        
            oBinding.filter(aFilters);
        },
        

        exportData: function() {
            var oTable = this.getView().byId("exportTable");
            var oRowBinding = oTable.getBinding("items");
            var aFilters = oRowBinding.aFilters;
        
            var oSettings = {
                workbook: {
                    columns: this.createColumnConfig()
                },
                dataSource: {
                    type: "odata",
                    //dataUrl: oRowBinding.sPath,                   //3 campi non strettamente necessari
                    //serviceUrl: oRowBinding.oModel.sServiceUrl,
                    //headers: oRowBinding.oModel.mCustomHeaders,
                    filters: aFilters
                },
                fileName: "dati.xlsx",
                worker: false
            };
        
            var oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function() {
                oSheet.destroy();
            });
        },

        openDatePicker: function(oEvent) {
			this.getView().byId("HiddenDP").openBy(oEvent.getSource().getDomRef());

		},

		changeDateHandler: async function(oEvent) {
			//sap.m.MessageToast.show("Date selected: " + oEvent.getParameter("value"));

            var oTable = this.getView().byId("exportTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            var sOrderDateId = this.byId("HiddenDP").getDateValue(); //MI PRENDO L'OGGETTO DATA CON IL .getValue PRENDO LA STRINGA 

           //formatDate(sOrderDateId);
          // var sOrderDateId = sOrderDateIdString.parse();

          var formattedData = this.formatDate(sOrderDateId);
        
            if (sOrderDateId) {
                var oFilter = new Filter("OrderDate", FilterOperator.EQ, formattedData);
                aFilters.push(oFilter);
            }

            var oModel =  new ODataModel("/V2/Northwind/Northwind.svc/");

            const oData = await new Promise((resolve, reject) => {
                oModel.read("/Orders", {
                    filters: aFilters,
                    success: function(oData, response) {
                        resolve(oData);
                    },
                    error: function(error) {
                        reject(error);
                    }
                });
            });

            this.getView().getModel("modOrder").setData(oData.results);
        
            oBinding.filter(aFilters);
		},
        
        
        navigateDettagli: function(){
            

           // this.getView().byId("exportTable").getSelectedItem().getBindingContext("modOrder").getObject(); //cercare su demokit 

            //var orderID = this.getView().byId("OrderID").getValue();
            //var customerID = this.getView().byId("CustomerID").getValue();

            var orderID = this.getView().byId("exportTable").getSelectedItem().getBindingContext("modOrder").getObject().OrderID;
            var customerID = this.getView().byId("exportTable").getSelectedItem().getBindingContext("modOrder").getObject().CustomerID;
        
        
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Dettagli", {
            orderID: orderID,
            customerID: customerID
          });
        },

        onValueHelpRequested: function() {
			this.loadFragment({
				name: "sap.btp.esodata.view.Prova"
			}).then(function(oDialog) {
				oDialog.open();
                this.getView().addDependent(oDialog); //appDepended espande gli ogeetti che sono sulla view anche nel fragment, serve per i18n e modelli e sono definiti li, non sono definiti sul fragment che non ha il controller
            }.bind(this))
        }


        //MIA PRIMA IMPLEMENTAZIONE FRAGMENT DA RIVEDERE PROBLEMA CON PATH 
       /*  fragmentTest: function(){
            var fragment = this.loadFragment({ //webapp/view/Prova.fragment.xml
                name: "webapp/view/Prova"
            }).then(function() {
                var theSameButton = this.byId("btnInFragment");
            }.bind(this));
        } */
        
        /*onRouteMatched: async function(oEvent) {

            const oModel = new ODataModel("/V2/Northwind/Northwind.svc/");
            
            await oModel.metadataLoaded(); //.then? chiedere a Matteo

           // const oFilter = new sap.ui.model.Filter("ProductID", sap.ui.model.FilterOperator.EQ, productId);

           //var CustomerID = "LAMAI";
        
            const oData = await new Promise((resolve, reject) => {
                oModel.read("/Orders", {
                    //filters: [oFilter],
                    filters: [new sap.ui.model.Filter("CustomerID", sap.ui.model.FilterOperator.EQ, "LAMAI")],
                    success: function(oData, response) {
                        resolve(oData);
                    },
                    error: function(error) {
                        reject(error);
                    }
                });
            });
            
            // const oJSONModel = new JSONModel();
            // oJSONModel.setData(oData);
            
            // this.getView().setModel(oJSONModel, "modelloTabella");
            this.getView().getModel("modelloTabella").setData(oData.results)
            
            
        },*/
        
        
        
        /*
        //capire come adattare il pezzo copiato qui giu nel mio codie per poter scaricare lo speadsheet
        exportData: function(){ //copiata da https://sapui5.hana.ondemand.com/#/entity/sap.ui.export.Spreadsheet/sample/sap.ui.export.sample.table/code
            var aCols, oRowBinding, oSettings, oSheet, oTable;

		    oTable = this.byId('exportTable');
			
			oRowBinding = oTable.getBinding('items').oList;
			aCols = this.createColumnConfig();

			oSettings = {
				workbook: {
					columns: aCols,
					hierarchyLevel: 'Level'
				},
				dataSource: oRowBinding,
				fileName: 'Prova Esportazione Tabella.xlsx',
                worker: false
            			};

            oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function() {
				oSheet.destroy();
            }
            )},
*/


            
            
        });
    });
    
    //spreadSheet
    //tabella e un tastino nella testata della tabella, fae un tasto con spreadSheet per scaricare 
    //toolbar sap.m.table 
    
    //Seleziono rigo, propietà table, e poi passo alla seconda view
    

//per andae a dettagli l'idea è quella di crearmi una funzione che mi gestisca la selezione del rigo e qui
// mi prende le Variabili del rigo selezionato OrderId e CustomerId, e faccio anche la chiamata a order_details con il filtro all'orderID



//FARE FUNZIONE CHE PRENDA I DUE FILTRI CUSTOMER ID E DATEPICKER E LI USA PER FARE LA CHIAMATA

//FUNZIONE CHE PARTE ALL'ONSEARCH DELLA FILTERBAR E RECUPERA TUTTI IFILTRI DELLA FILTERBAR PER FARE ALL'ODATA

//ALL'AVVIO HO QUESTO OEVENT DA CUI SI PUò RECUPERARE L'INTERA FILTERBAR CHE HO NELLA DYNAMIC PAGE E COSI POSSO OTTENERE TUTTI I FILTRI, 