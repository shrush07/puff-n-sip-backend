"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["NEW"] = "NEW";
    OrderStatus["MODIFIED"] = "MODIFIED";
    OrderStatus["UPDATED"] = "UPDATED";
    OrderStatus["UNPAID"] = "UNPAID";
    OrderStatus["PAYED"] = "PAYED";
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["CANCELED"] = "CANCELED";
    OrderStatus["REFUNDED"] = "REFUNDED";
    OrderStatus["COMPLETED"] = "COMPLETED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
