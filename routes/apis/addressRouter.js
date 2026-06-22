import { Router } from 'express';

import ListAddressController from '../../app/Http/Controllers/AddressApi/ListAddressController.js';
import GetAddressController from '../../app/Http/Controllers/AddressApi/GetAddressController.js';
import CreateAddressController from '../../app/Http/Controllers/AddressApi/CreateAddressController.js';
import UpdateAddressController from '../../app/Http/Controllers/AddressApi/UpdateAddressController.js';
import DeleteAddressController from '../../app/Http/Controllers/AddressApi/DeleteAddressController.js';
import AuthMiddleware from '../../app/Http/Middlewares/AuthMiddleware.js';
import CheckResourceOwnerMiddleware from '../../app/Http/Middlewares/CheckResourceOwnerMiddleware.js';
import AddressModel from '../../app/Models/AddressModel.js';

export default (() => {
    const router = Router();

    // Listar endereços do usuário autenticado
    router.get('/', AuthMiddleware, ListAddressController);

    // Obter um endereço específico (protegido - apenas proprietário ou admin)
    router.get('/:id', AuthMiddleware, CheckResourceOwnerMiddleware(AddressModel, 'id_user'), GetAddressController);

    // Criar endereço (protegido - requer autenticação)
    router.post('/', AuthMiddleware, CreateAddressController);

    // Atualizar endereço (protegido - apenas proprietário ou admin)
    router.put('/:id', AuthMiddleware, CheckResourceOwnerMiddleware(AddressModel, 'id_user'), UpdateAddressController);

    // Deletar endereço (protegido - apenas proprietário ou admin)
    router.delete('/:id', AuthMiddleware, CheckResourceOwnerMiddleware(AddressModel, 'id_user'), DeleteAddressController);

    return router;
})();