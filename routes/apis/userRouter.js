import { Router } from 'express';

import ListUserController from '../../app/Http/Controllers/UserApi/ListUserController.js';
import GetUserController from '../../app/Http/Controllers/UserApi/GetUserController.js';
import CreateUserController from '../../app/Http/Controllers/UserApi/CreateUserController.js';
import UpdateUserController from '../../app/Http/Controllers/UserApi/UpdateUserController.js';
import DeleteUserController from '../../app/Http/Controllers/UserApi/DeleteUserController.js';
import UploadImageController from '../../app/Http/Controllers/UserApi/UploadImageController.js';
import VerifyImageMiddleware from '../../app/Http/Middlewares/VerifyImageMiddleware.js';
import AuthMiddleware from '../../app/Http/Middlewares/AuthMiddleware.js';
import CheckOwnerOrAdminMiddleware from '../../app/Http/Middlewares/CheckOwnerOrAdminMiddleware.js';
import CheckAdminMiddleware from '../../app/Http/Middlewares/CheckAdminMiddleware.js';

export default (() => {
    const router = Router();

    // Apenas admin pode listar todos os usuários
    router.get('/', AuthMiddleware, CheckAdminMiddleware, ListUserController);

    // Usuário pode acessar seus próprios dados ou admin qualquer um
    router.get('/:id', AuthMiddleware, CheckOwnerOrAdminMiddleware, GetUserController);

    // Criar usuário é público (login), mas requer validação de dados
    router.post('/', CreateUserController);

    // Usuário pode atualizar seus próprios dados ou admin atualizar qualquer um
    router.put('/:id', AuthMiddleware, CheckOwnerOrAdminMiddleware, UpdateUserController);

    // Upload de imagem requer autenticação e ser o proprietário ou admin
    router.post('/image/:id', AuthMiddleware, CheckOwnerOrAdminMiddleware, VerifyImageMiddleware, UploadImageController);

    // Deletar requer autenticação e ser o proprietário ou admin
    router.delete('/:id', AuthMiddleware, CheckOwnerOrAdminMiddleware, DeleteUserController);

    return router;
})();
