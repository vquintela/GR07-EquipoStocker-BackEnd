/**
 * @swagger
 * tags:
 *  name: Upload
 *  description: Endpoint para el consumo de imagenes
 */

//requires
var express = require("express");
const fileUpload = require("express-fileupload");
var app = express();
var Usuario = require("../models/usuario");
var Producto = require("../models/producto");
var Cliente = require("../models/cliente");
var Proveedor = require("../models/proveedor");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
var jwt = require("jsonwebtoken");
var mdAutenticacion = require("../middlewares/autenticacion");

//contexto de fileUpload
app.use(fileUpload());

/**
 * @swagger
 * /upload/{tipo}/{id}:
 *  put:
 *      summary: Se actualiza imagen de la coleccion indicada
 *      tags: [Upload]
 *      parameters:
 *          -   in: path
 *              name: tipo
 *              schema:
 *                  type: string
 *                  enum: ["productos", "usuarios", "clientes", "proveedores"]
 *              required: true
 *              description: Coleccion correspondiente a la imagen
 *          -   in: path
 *              name: id
 *              schema:
 *                  type: string
 *              required: true
 *              description: Id de la imagen enviada
 *      responses:
 *          200:
 *              description: Imagen actualizada
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                                  ok:
 *                                      type: boolean
 *                                  msg:                         
 *                                      type: string
 *                                  nombreArchivo:
 *                                      type: string
 *          400:
 *              description: Error al actualizar la imagen
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Errors'
 */
app.put("/:tipo/:id", (req, res) => {
    //para actualizar una foto se envia un put . Se envia como params el tipo de coleccion
    // y el id valido.
    var tipo = req.params.tipo;
    var id = req.params.id;
    var tiposValidos = ["productos", "usuarios", "clientes", "proveedores"];

    if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({
            ok: false,
            mensaje: "Tipo de coleccion no valida",
            errors: { message: "Tipo de coleccion no valida" },
        });
    }
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: "No selecciono ninguna imagen",
            errors: { message: "Debe seleccionar una imagen" },
            req: req.files,
        });
    }
    // se desarma el nombre y la extension para validar que el file enviado sea aceptado
    const file = req.files.imagen;
    const nombreCortado = file.name.split(".");
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];
    var extensionesValidas = ["png", "jpg", "gif", "jpeg"];

    if (!extensionesValidas.includes(extensionArchivo)) {
        return res.status(400).json({
            ok: false,
            mensaje: "Extension no valida",
            errors: { message: "Las extensiones validas son: " + extensionesValidas },
        });
    }
    // se convierte el nombre del archivo con la lib uuid
    const nombreArchivo = `${uuidv4()}.${extensionArchivo}`;

    const path = `./uploads/${tipo}/${nombreArchivo}`;

    file.mv(path, (error) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                msg: "Error al mover la imagen",
            });
        }
        actualizarImagen(tipo, id, nombreArchivo);
        res.status(200).json({
            ok: true,
            msg: "Archivo subido",
            nombreArchivo,
        });
    });
});

const borrarImagen = (path) => {
    if (fs.existsSync(path)) {
        //borra la img
        fs.unlinkSync(path);
    }
};

//switch para validar cada coleccion y borrar imagen de ser necesario.
actualizarImagen = async(tipo, id, nombreArchivo) => {
    let pathViejo = "";
    switch (tipo) {
        case "usuarios":
            const usuario = await Usuario.findById(id);

            if (!usuario) {
                return false;
            }

            pathViejo = `./uploads/usuarios/${usuario.img}`;
            //borrarImagen(pathViejo);
            usuario.img = nombreArchivo;
            await usuario.save();
            return true;
            break;

        case "productos":
            const producto = await Producto.findById(id);

            if (!producto) {
                return false;
            }

            pathViejo = `./uploads/productos/${producto.img}`;
            borrarImagen(pathViejo);
            producto.img = nombreArchivo;
            await producto.save();
            return true;
            break;

        case "clientes":
            const cliente = await Cliente.findById(id);

            if (!cliente) {
                return false;
            }

            pathViejo = `./uploads/clientes/${cliente.img}`;
            borrarImagen(pathViejo);
            cliente.img = nombreArchivo;
            await cliente.save();
            return true;
            break;

        case "proveedores":
            const proveedor = await Proveedor.findById(id);

            if (!proveedor) {
                return false;
            }

            pathViejo = `./uploads/proveedor/${proveedor.img}`;
            borrarImagen(pathViejo);
            proveedor.img = nombreArchivo;
            await proveedor.save();
            return true;
            break;
    }
};

/**
 * @swagger
 * /upload/{tipo}/{foto}:
 *  get:
 *      summary: Retorna la imagen indicada
 *      tags: [Upload]
 *      parameters:
 *          -   in: path
 *              name: tipo
 *              schema:
 *                  type: string
 *              required: true
 *              description: Tipo de imagen
 *          -   in: path
 *              name: foto
 *              schema:
 *                  type: string
 *              required: true
 *              description: Id de la imagen
 *      responses:
 *          200:
 *              description: Retorna la imagen
 *              content:
 *                  image/png:
 *                      schema:
 *                          items:
 *                              type: string
 *                              format: binary
 *          500:
 *              description: Error al encontrar la imagen
 */
app.get("/:tipo/:foto", (req, res) => {
    const tipo = req.params.tipo;
    const foto = req.params.foto;

    const pathImg = path.join(__dirname, `../uploads/${tipo}/${foto}`);

    //img por defecto
    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {
        const pathImg = path.join(__dirname, `../uploads/no-img.jpg`);
        res.sendFile(pathImg);
    }
});

module.exports = app;