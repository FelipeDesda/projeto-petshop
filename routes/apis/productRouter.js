import { Router } from "express";

import ListProductController from "../../app/Http/Controllers/ProductApi/ListProductController.js";
import GetProductController from "../../app/Http/Controllers/ProductApi/GetProductController.js";
import CreateProductController from "../../app/Http/Controllers/ProductApi/CreateProductController.js";
import UpdateProductController from "../../app/Http/Controllers/ProductApi/UpdateProductController.js";
import DeleteProductController from "../../app/Http/Controllers/ProductApi/DeleteProductController.js";
import AuthMiddleware from "../../app/Http/Middlewares/AuthMiddleware.js";
import CheckAdminMiddleware from "../../app/Http/Middlewares/CheckAdminMiddleware.js";

export default (() => {
    const router = Router();

    // GET products é público (catálogo)
    router.get("/", ListProductController);
    router.get("/:id", GetProductController);

    // POST, PUT, DELETE requer autenticação e role admin
    router.post("/", AuthMiddleware, CheckAdminMiddleware, CreateProductController);
    router.put("/:id", AuthMiddleware, CheckAdminMiddleware, UpdateProductController);
    router.delete("/:id", AuthMiddleware, CheckAdminMiddleware, DeleteProductController);

    return router;
})();
