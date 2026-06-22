/**
 * Middleware factory para verificar se o usuário é proprietário do recurso.
 * 
 * Uso:
 *   router.put('/:id', AuthMiddleware, CheckResourceOwnerMiddleware(AddressModel, 'id_user'), UpdateAddressController);
 * 
 * @param {Model} model - Modelo Sequelize (ex: AddressModel)
 * @param {string} userForeignKey - Nome da coluna com id do usuário (ex: 'id_user')
 */
export default function CheckResourceOwnerMiddleware(model, userForeignKey = 'id_user') {
    return async (request, response, next) => {
        try {
            const userId = request.user.id;
            const userRole = request.user.role;
            const resourceId = Number(request.params.id);

            // Admin pode fazer tudo
            if (userRole === 'admin') {
                return next();
            }

            // Busca o recurso no banco
            const resource = await model.findByPk(resourceId);

            if (!resource) {
                return response.status(404).json({
                    error: "Resource not found"
                });
            }

            // Verifica se o usuário é o proprietário
            if (resource[userForeignKey] !== userId) {
                return response.status(403).json({
                    error: "Access denied: You can only access your own resources"
                });
            }

            // Armazena o recurso no request para uso no controller
            request.resource = resource;

            next();
        } catch (error) {
            console.error(error);

            return response.status(500).json({
                error: "Internal server error"
            });
        }
    };
}
