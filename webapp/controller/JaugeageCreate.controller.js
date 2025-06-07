sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, MessageToast, History) {
    "use strict";

    return Controller.extend("project1.controller.JaugeageCreate", {

        onInit: function () {
            this._oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(this._oModel);
            this._oRouter = this.getOwnerComponent().getRouter();
            this._oRouter.getRoute("JaugeageCreate").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const oArgs = oEvent.getParameter("arguments");
            const sSortieId = oArgs?.SortieId;

            if (sSortieId) {
                const sPath = this._oModel.createKey("/YJAUGEAGE_CDS", {
                    id_sortie: sSortieId
                });

                this.getView().bindElement({
                    path: sPath,
                    parameters: { expand: "bac" },
                    events: {
                        dataRequested: () => this.getView().setBusy(true),
                        dataReceived: () => this.getView().setBusy(false)
                    }
                });
            } else {
                // Création d'une nouvelle entrée vide
                const oContext = this._oModel.createEntry("/YJAUGEAGE_CDS", {
                    properties: {}
                });
                this.getView().setBindingContext(oContext);
            }
        },

        onSavePress: function () {
            const oView = this.getView();
            const oModel = this._oModel;
            const oContext = oView.getBindingContext();

            let oData = oContext.getObject();

            // Récupérer bac_source et marketer via les ComboBox
            let bac_concerne = oView.byId("bacComboJ").getSelectedKey();

            // Remplir les champs de l'entrée
            oData.bac_concerne = parseInt(bac_concerne, 10);

            oModel.create("/YJAUGEAGE_CDS", oData, {
                            success: () => {
                                MessageToast.show("jaugeage enregistrée avec succès.");
                                this._navToList();
                            },
                            error: (oError) => {
                                MessageToast.show("Erreur lors de l'enregistrement.");
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
            this._oRouter.navTo("jaugeage", {}, true);
        }

    });
});
