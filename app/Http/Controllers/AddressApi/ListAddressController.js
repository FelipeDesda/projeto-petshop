import AddressModel from "../../../Models/AddressModel.js";
import UserModel from "../../../Models/UserModel.js";

export default async function ListAddressController(request, response) {
    try {
        const userId = request.user.id;
        const pageRequest = Number(request.query.page) || 1;
        const limitRequest = Number(request.query.limit) || 10;

        const page = (pageRequest < 1) ? 1 : pageRequest;
        const limit = (limitRequest > 20) ? 20 : ((limitRequest < 1) ? 10 : limitRequest);
        const offset = (page - 1) * limit;

        let next = null;

        const { rows, count: total } = await AddressModel.findAndCountAll({
            where: {
                id_user: userId
            },
            include: [
                {
                    model: UserModel,
                    as: "user"
                }
            ],
            order: [["id", "ASC"]],
            limit: limit + 1,
            offset: offset,
            distinct: true
        });

        const addresses = rows;

        if (addresses.length > limit) {
            next = page + 1;
            addresses.pop();
        }

        return response.json({
            page: page,
            limit: limit,
            total: total,
            next: next,
            data: addresses
        });
    } catch (error) {
        console.error(error);

        return response.status(500).json({
            error: "Internal server error"
        });
    }
}
