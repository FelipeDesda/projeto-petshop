/**
 * Middleware para verificar se o usuário tem papel de admin.
 * 
 * Requer:
 *   - request.user já preenchido pelo AuthMiddleware
 *   - request.user.role === 'admin'
 * 
 * Se não for admin, retorna 403 Forbidden.
 */
export default function CheckAdminMiddleware(request, response, next) {
    try {
        const userRole = request.user.role;

        // Apenas admin pode prosseguir
        if (userRole === 'admin') {
            return next();
        }

        // Acesso negado
        return response.status(403).json({
            error: "Access denied: Admin role required"
        });
    } catch (error) {
        console.error(error);

        return response.status(500).json({
            error: "Internal server error"
        });
    }
}
