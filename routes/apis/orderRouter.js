import { Router } from "express";

import ListOrderController from "../../app/Http/Controllers/OrderApi/ListOrderController.js";
import GetOrderController from "../../app/Http/Controllers/OrderApi/GetOrderController.js";
import CreateOrderController from "../../app/Http/Controllers/OrderApi/CreateOrderController.js";
import UpdateOrderController from "../../app/Http/Controllers/OrderApi/UpdateOrderController.js";
import DeleteOrderController from "../../app/Http/Controllers/OrderApi/DeleteOrderController.js";
import AuthMiddleware from "../../app/Http/Middlewares/AuthMiddleware.js";
import CheckResourceOwnerMiddleware from "../../app/Http/Middlewares/CheckResourceOwnerMiddleware.js";
import OrderModel from "../../app/Models/OrderModel.js";

export default (() => {
    const router = Router();

    // Listar pedidos do usuário autenticado
    router.get("/", AuthMiddleware, ListOrderController);

    // Obter um pedido específico (protegido - apenas proprietário ou admin)
    router.get("/:id", AuthMiddleware, CheckResourceOwnerMiddleware(OrderModel, 'id_user'), GetOrderController);

    // Criar pedido (protegido - requer autenticação)
    router.post("/", AuthMiddleware, CreateOrderController);

    // Atualizar pedido (protegido - apenas proprietário ou admin)
    router.put("/:id", AuthMiddleware, CheckResourceOwnerMiddleware(OrderModel, 'id_user'), UpdateOrderController);

    // Deletar pedido (protegido - apenas proprietário ou admin)
    router.delete("/:id", AuthMiddleware, CheckResourceOwnerMiddleware(OrderModel, 'id_user'), DeleteOrderController);

    return router;
})();
