// requires
var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

// importando esquema
var Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *  schemas:
 *      Usuario:
 *          type: object
 *          required:
 *              - nombre
 *              - apellido
 *              - empresa
 *              - email
 *              - password
 *              - cuit
 *              - dni
 *              - estado
 *              - role
 *          properties:
 *              nombre:
 *                  type: string
 *              apellido:
 *                  type: string
 *              empresa:
 *                  type: string
 *              email:
 *                  type: string
 *              password:
 *                  type: string
 *              direccion:
 *                  type: string
 *              cuit:
 *                  type: string
 *              telefono:
 *                  type: string
 *              dni:
 *                  type: string
 *              img:
 *                  type: string
 *              role:
 *                  type: string
 *                  enum: ["ADMIN_ROLE", "USER_ROLE", "SALES_ROLE", "DEPOSIT_ROLE"]
 *                  default: "ADMIN_ROLE"
 *              usuario:
 *                  type: string
 */
var rolesValidos = {
    values: ["ADMIN_ROLE", "USER_ROLE", "SALES_ROLE", "DEPOSIT_ROLE"],
    message: "{VALUE} no es un rol permitido ",
};

// generando campos al schema

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, "El nombre es necesario"] },
    apellido: { type: String, required: [true, "El apellido es necesario"] },
    empresa: {
        type: String,
        required: [true, "El nombre de la empresa es necesario"],
    },
    email: {
        type: String,
        unique: true,
        required: [true, "El correo es necesario"],
    },
    password: { type: String, required: [true, " La contraseña es necesaria"] },
    direccion: { type: String, required: false },
    cuit: {
        type: String,
        unique: true,
        required: [true, "El cuit es necesario"],
    },
    telefono: { type: String, required: false },
    dni: { type: String, unique: true, required: [true, "El dni es necesario"] },
    img: { type: String, required: false },
    role: {
        type: String,
        required: true,
        default: "ADMIN_ROLE",
        enum: rolesValidos,
    },
    usuario: { type: String, required: false },
});

// validando path
usuarioSchema.plugin(uniqueValidator, { message: "debe ser único" });

// exportando el modulo para utilizarlo
module.exports = mongoose.model("Usuario", usuarioSchema);