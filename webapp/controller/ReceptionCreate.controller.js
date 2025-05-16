sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, MessageToast, History) {
    "use strict";

    return Controller.extend("project1.controller.ReceptionCreate", {
        onInit: function () {
            this._oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(this._oModel);

            this._oRouter = this.getOwnerComponent().getRouter();
            this._oRouter.getRoute("ReceptionCreate").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const oArgs = oEvent.getParameter("arguments");
            const sReceptionId = oArgs.ReceptionId;

            if (sReceptionId) {
                const sPath = this._oModel.createKey("/YRECEPTIONS_CDS", {
                    id_receptions: sReceptionId
                });

                this.getView().bindElement({
                    path: sPath,
                    parameters: {
                        expand: "client"
                    },
                    events: {
                        dataRequested: () => this.getView().setBusy(true),
                        dataReceived: () => this.getView().setBusy(false)
                    }
                });
            } else {
                const oContext = this._oModel.createEntry("/YRECEPTIONS_CDS", {
                    properties: {
                        // valeurs par défaut si nécessaire
                    }
                });
                this.getView().setBindingContext(oContext);
            }
        },

        onSavePress: function () {
    var oView = this.getView();
    var oModel = this._oModel;
    var oContext = oView.getBindingContext();

    // Récupérer les données saisies dans le formulaire
    var oData = oContext.getObject();

    oModel.create("/YRECEPTIONS_CDS", oData, {
        success: function () {
            sap.m.MessageToast.show("Réception enregistrée avec succès.");
            // Navigation vers la liste après création réussie
            this._navToList();
        }.bind(this),
        error: function (oError) {
            sap.m.MessageToast.show("Erreur lors de l'enregistrement.");
            console.error(oError);
        }
    });
},



        onCancelPress: function () {
            const oContext = this.getView().getBindingContext();

            if (this._oModel.hasPendingChanges()) {
                this._oModel.resetChanges([oContext.getPath()]);
            }

            if (oContext && oContext.bCreated) {
                this._oModel.deleteCreatedEntry(oContext);
            }

            this._navToList();
        },

        onNavBack: function () {
            const sPreviousHash = History.getInstance().getPreviousHash();
            sPreviousHash ? window.history.go(-1) : this._navToList();
        },

        _navToList: function () {
            this._oRouter.navTo("receptions", {}, true);
        },

        onValueHelpFournisseur: function(oEvent) {
    var oView = this.getView();

    if (!this._oFournisseurHelpDialog) {
        this._oFournisseurHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
            basicSearchText: "",
            supportMultiselect: false,
            supportRanges: false,
            supportRangesOnly: false,
            key: "id_client", // <-- clé du fournisseur
            descriptionKey: "nom_client", // <-- champ lisible
            title: "Sélectionner un Fournisseur",
            ok: function(oEvent) {
                var oSelected = oEvent.getParameter("tokens")[0];
                if (oSelected) {
                    var sKey = oSelected.getKey();
                    oEvent.getSource().getParent().getParent().getParent().getModel().setProperty("/fournisseurs", sKey);
                }
                this.close();
            },
            cancel: function() {
                this.close();
            },
            afterClose: function() {
                this.destroy();
                this._oFournisseurHelpDialog = null;
            }.bind(this)
        });

        // Charger les données du fournisseur dans un model JSON ou OData
        var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
            advancedMode: false,
            filterBarExpanded: false,
            showGoOnFB: false,
            search: function(oEvent) {
                var sQuery = oEvent.getParameter("selectionSet")[0].getValue();
                var oBinding = this._oFournisseurHelpDialog.getTable().getBinding("rows");
                oBinding.filter(new sap.ui.model.Filter("nom_client", sap.ui.model.FilterOperator.Contains, sQuery));
            }.bind(this)
        });

        oFilterBar.setBasicSearch(new sap.m.SearchField({
            showSearchButton: false,
            placeholder: "Rechercher...",
            liveChange: function(oEvent) {
                var sQuery = oEvent.getParameter("newValue");
                var oBinding = this._oFournisseurHelpDialog.getTable().getBinding("rows");
                oBinding.filter(new sap.ui.model.Filter("nom_client", sap.ui.model.FilterOperator.Contains, sQuery));
            }
        }));

        this._oFournisseurHelpDialog.setFilterBar(oFilterBar);

        // Table OData standard (tu peux l’adapter en JSON si besoin)
        var oTable = new sap.ui.table.Table({
            selectionMode: sap.ui.table.SelectionMode.Single,
            visibleRowCount: 10
        });

        oTable.addColumn(new sap.ui.table.Column({
            label: new sap.m.Label({ text: "ID" }),
            template: new sap.m.Text({ text: "{id_client}" })
        }));

        oTable.addColumn(new sap.ui.table.Column({
            label: new sap.m.Label({ text: "Nom" }),
            template: new sap.m.Text({ text: "{nom_client}" })
        }));

        oTable.setModel(this.getView().getModel()); // ODataModel
        oTable.bindRows("/YCLIENTSSet"); // <-- ton entitySet OData

        this._oFournisseurHelpDialog.setTable(oTable);
    }

    this._oFournisseurHelpDialog.open();
}



    });
});
