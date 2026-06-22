import { Router } from "express";

import ListPetController from "../../app/Http/Controllers/PetApi/ListPetController.js";
import GetPetController from "../../app/Http/Controllers/PetApi/GetPetController.js";
import CreatePetController from "../../app/Http/Controllers/PetApi/CreatePetController.js";
import UpdatePetController from "../../app/Http/Controllers/PetApi/UpdatePetController.js";
import DeletePetController from "../../app/Http/Controllers/PetApi/DeletePetController.js";
import AuthMiddleware from "../../app/Http/Middlewares/AuthMiddleware.js";
import CheckResourceOwnerMiddleware from "../../app/Http/Middlewares/CheckResourceOwnerMiddleware.js";
import PetModel from "../../app/Models/PetModel.js";

export default (() => {
    const router = Router();

    // Listar pets do usuário autenticado
    router.get("/", AuthMiddleware, ListPetController);

    // Obter um pet específico (protegido - apenas proprietário ou admin)
    router.get("/:id", AuthMiddleware, CheckResourceOwnerMiddleware(PetModel, 'id_user'), GetPetController);

    // Criar pet (protegido - requer autenticação)
    router.post("/", AuthMiddleware, CreatePetController);

    // Atualizar pet (protegido - apenas proprietário ou admin)
    router.put("/:id", AuthMiddleware, CheckResourceOwnerMiddleware(PetModel, 'id_user'), UpdatePetController);

    // Deletar pet (protegido - apenas proprietário ou admin)
    router.delete("/:id", AuthMiddleware, CheckResourceOwnerMiddleware(PetModel, 'id_user'), DeletePetController);

    return router;
})();
