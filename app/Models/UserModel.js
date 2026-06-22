import { DataTypes } from 'sequelize'
import sequelize from '../../database/connections/sequelize.js'

const UserModel = sequelize.define(
    'UserModel',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        name: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        email: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true
        },

        password: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        phone: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        picture: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        role: {
            type: DataTypes.ENUM('user', 'admin', 'moderator'),
            allowNull: false,
            defaultValue: 'user'
        }
    },
    {
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
)

export default UserModel
