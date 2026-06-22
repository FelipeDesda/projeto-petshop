/**
 * Middleware para verificar se o usuário é admin ou o proprietário do recurso.
 * 
 * Verifica:
 *   - Se o usuário é admin: permite qualquer acesso
 *   - Se o usuário é o proprietário do recurso (id do request.params === id do usuário): permite
 *   - Caso contrário: nega acesso com 403
 * 
 * Requer:
 *   - request.user já preenchido pelo AuthMiddleware
 *   - request.params.id com o ID do recurso a ser acessado
 */
export default function CheckOwnerOrAdminMiddleware(request, response, next) {
    try {
        const userId = request.user.id;
        const userRole = request.user.role;
        const targetId = Number(request.params.id);

        // Admin pode fazer tudo
        if (userRole === 'admin') {
            return next();
        }

        // User só pode acessar seus próprios dados
        if (userId === targetId) {
            return next();
        }

        // Acesso negado
        return response.status(403).json({
            error: "Access denied: You can only access your own data"
        });
    } catch (error) {
        console.error(error);

        return response.status(500).json({
            error: "Internal server error"
        });
    }
}
