sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, MessageToast, History) {
    "use strict";

    return Controller.extend("project1.controller.TransfertCreate", {

        onInit: function () {
            this._oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(this._oModel);
            this._oRouter = this.getOwnerComponent().getRouter();
            this._oRouter.getRoute("TransfertCreate").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const oArgs = oEvent.getParameter("arguments");
            const sSortieId = oArgs?.SortieId;

            if (sSortieId) {
                const sPath = this._oModel.createKey("/YTRANSFERT_BACS_CDS", {
                    id_sortie: sSortieId
                });

                this.getView().bindElement({
                    path: sPath,
                    parameters: { expand: "BacSrc,BacDest" },
                    events: {
                        dataRequested: () => this.getView().setBusy(true),
                        dataReceived: () => this.getView().setBusy(false)
                    }
                });
            } else {
                // Création d'une nouvelle entrée vide
                const oContext = this._oModel.createEntry("/YTRANSFERT_BACS_CDS", {
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
            let bacSource = oView.byId("SourceComboT").getSelectedKey();
            let bac_destination = oView.byId("DestComboT").getSelectedKey();

            // Remplir les champs de l'entrée
            oData.bac_source = parseInt(bacSource, 10);
            oData.bac_destination = parseInt(bac_destination, 10);

            // Lire le bac source pour récupérer le produit associé
            this._oModel.read("/YBACS_CDS(" + bacSource + ")", {
                success: (oBacData) => {
                    if (oBacData) {
                        oData.product_from = parseInt(oBacData.product, 10);
                        this._oModel.read("/YBACS_CDS(" + bac_destination + ")", {
                            success: (oBacData) => {
                                if (oBacData) {
                                    oData.product_to = parseInt(oBacData.product, 10);
                                    console.log("avant création", oData);
                                    // Créer la sortie
                                    oModel.create("/YTRANSFERT_BACS_CDS", oData, {
                                        success: () => {
                                            MessageToast.show("Sortie enregistrée avec succès.");
                                            this._navToList();
                                        },
                                        error: (oError) => {
                                            MessageToast.show("Erreur lors de l'enregistrement.");
                                            console.error(oError);
                                        }
                                    });
                                } else {
                                    MessageToast.show("Produit introuvable pour ce bac.");
                                }
                            },
                            error: (oError) => {
                                console.error("Erreur lors de la lecture du bac : ", oError);
                                MessageToast.show("Erreur lors de la récupération du produit.");
                            }
                        });
                    } else {
                        MessageToast.show("Produit introuvable pour ce bac.");
                    }
                },
                error: (oError) => {
                    console.error("Erreur lors de la lecture du bac : ", oError);
                    MessageToast.show("Erreur lors de la récupération du produit.");
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
            this._oRouter.navTo("transferts", {}, true);
        }

    });
});
