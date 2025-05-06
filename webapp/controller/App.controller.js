sap.ui.define(["./BaseController"], function (BaseController) {
	"use strict";

	return BaseController.extend("project1.controller.App", {
		onInit: function () {
			const hash = window.location.hash;
	  
			const oRouter = this.getOwnerComponent().getRouter();
			// On redirige selon le hash principal
			if (hash.includes("project1-product")) {
			  oRouter.navTo("product");
			} else if (hash.includes("project1-copy")) {
			  oRouter.navTo("copy");
			}
		  }
	});
});
