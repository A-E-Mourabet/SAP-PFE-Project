/*global QUnit*/
import Controller from "project1/controller/product.controller";

QUnit.module("product_view Controller");

QUnit.test("I should test the product_view controller", function (assert: Assert) {
	const oAppController = new Controller("product_view");
	oAppController.onInit();
	assert.ok(oAppController);
});