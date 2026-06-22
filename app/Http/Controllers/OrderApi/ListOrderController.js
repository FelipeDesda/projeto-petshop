import OrderModel from "../../../Models/OrderModel.js";
import OrderItemModel from "../../../Models/OrderItemModel.js";
import ProductModel from "../../../Models/ProductModel.js";
import UserModel from "../../../Models/UserModel.js";

export default async function ListOrderController(request, response) {
    try {
        const userId = request.user.id;
        const pageRequest = Number(request.query.page) || 1;
        const limitRequest = Number(request.query.limit) || 10;
        const page = pageRequest < 1 ? 1 : pageRequest;
        const limit = limitRequest > 20 ? 20 : (limitRequest < 1 ? 10 : limitRequest);
        const offset = (page - 1) * limit;

        const { rows, count: total } = await OrderModel.findAndCountAll({
            where: {
                id_user: userId
            },
            include: [
                { model: UserModel, as: "customer" },
                { model: OrderItemModel, as: "items", include: [{ model: ProductModel, as: "product" }] }
            ],
            order: [["id", "ASC"]],
            limit: limit + 1,
            offset,
            distinct: true
        });

        const orders = rows;
        const next = orders.length > limit ? page + 1 : null;
        if (next) orders.pop();

        return response.json({ page, limit, total, next, data: orders });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: "Internal server error" });
    }
}
