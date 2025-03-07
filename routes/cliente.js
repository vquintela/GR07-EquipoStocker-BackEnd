/**
 * @swagger
 * tags:
 *  name: Cliente
 *  description: Endpoint para el manejo de los clientes
 */

//requires
var express = require("express");
var app = express();

// //json web token
var jwt = require("jsonwebtoken");

//requiere modelo
var Cliente = require("../models/cliente");

//middleware
var mdAutenticacion = require("../middlewares/autenticacion");

/**
 * @swagger
 * /cliente?desde={desde}:
 *  get:
 *      summary: Retorna la lista de clientes, cantidad maxima 15
 *      tags: [Cliente]
 *      parameters:
 *          -   in: query
 *              name: desde
 *              schema:
 *                  type: number
 *              description: Numero desde donde empieza la paginacion
 *      responses:
 *          200:
 *              description: Lista de clientes
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                                  ok:
 *                                      type: boolean
 *                                  clientes:                         
 *                                      type: array
 *                                      items:
 *                                          $ref: '#/components/schemas/Cliente'
 *                                  usuario_modifica:
 *                                      $ref: '#/components/schemas/Cliente'
 *                                  total:                         
 *                                      type: number
 *          500:
 *              description: Error cargando clientes
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Errors'
 */
app.get("/", (req, res) => {
    // enumerando
    var desde = req.query.desde || 0;
    // busca y mapea los atributos marcados
    Cliente.find({}, "nombre apellido email direccion cuit telefono dni img estado")
        .skip(desde)
        .limit(15)
        .populate("usuario", "email")
        // ejecuta, puede tener un error manejado.
        .exec((err, clientes, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando clientes",
                    errors: err,
                });
            }
            // metodo count donde va contando clientes simplemente muestra un int que se incrementa con cada nuevo registro
            Cliente.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    clientes: clientes,
                    usuario_modifica: usuario,
                    total: conteo,
                });
            });
        });
});

/**
 * @swagger
 * /cliente:
 *  post:
 *      summary: Se crea un cliente
 *      tags: [Cliente]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Cliente'
 *      responses:
 *          201:
 *              description: Cliente creado
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              ok:
 *                                  type: boolean
 *                              cliente:
 *                                  $ref: '#/components/schemas/Cliente'
 *                              clienteToken:
 *                                  type: string
 *          400:
 *              description: Error al crear usuario
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Errors'
 */
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    // seteo el body que viaja en el request. Todos los campos required del modelo deben estar aca si no falla
    // esto se setea en postan. Al hacer la peticion post en el body tipo x-www-form-urlencoded.

    var body = req.body;

    var cliente = new Cliente({
        nombre: body.nombre,
        apellido: body.apellido,
        email: body.email,
        direccion: body.direccion,
        cuit: body.cuit,
        telefono: body.telefono,
        dni: body.dni,
        img: body.img,
        usuario: body.usuario,
        estado: body.estado,
    });

    // si se mando el request correcto se guarda. Este metodo puede traer un error manejado.
    cliente.save((err, clienteGuardado) => {
        // si hay un error....
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear usuario",
                errors: err,
            });
        }
        // si pasa ok ...
        res.status(201).json({
            ok: true,
            cliente: clienteGuardado,
            clienteToken: req.cliente,
        });
    });
});

/**
 * @swagger
 * /cliente/{id}:
 *  put:
 *      summary: Se modifica un cliente
 *      tags: [Cliente]
 *      parameters:
 *          -   in: path
 *              name: id
 *              schema:
 *                  type: string
 *              required: true
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Cliente'
 *      responses:
 *          200:
 *              description: Cliente modificado
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              ok:
 *                                  type: boolean
 *                              cliente:
 *                                  $ref: '#/components/schemas/Cliente'
 *          400:
 *              description: Error al actualizar cliente
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          500:
 *              description: Error al actualizar cliente
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Errors'
 */
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Cliente.findById(id, (err, cliente) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar cliente",
                errors: err,
            });
        }

        if (!cliente) {
            return res.status(400).json({
                ok: false,
                mensaje: "El cliente con el ID" + id + " no existe",
                errors: { message: " No existe un cliente con ese ID" },
            });
        }

        cliente.nombre = body.nombre;
        cliente.apellido = body.apellido;
        cliente.email = body.email;
        cliente.direccion = body.direccion;
        cliente.cuit = body.cuit;
        cliente.telefono = body.telefono;
        cliente.dni = body.dni;
        cliente.usuario = body.usuario;
        cliente.estado = body.estado;

        cliente.save((err, clienteGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar cliente",
                    errors: err,
                });
            }
            clienteGuardado.password = "=)";

            res.status(200).json({
                ok: true,
                usuario: clienteGuardado,
            });
        });
    });
});

/**
 * @swagger
 * /cliente/{id}:
 *  delete:
 *      summary: Se elimina un cliente
 *      tags: [Cliente]
 *      parameters:
 *          -   in: path
 *              name: id
 *              schema:
 *                  type: string
 *              required: true
 *              description: Id del cliente
 *      responses:
 *          200:
 *              description: Cliente eliminado
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              ok:
 *                                  type: boolean
 *                              cliente:
 *                                  $ref: '#/components/schemas/Cliente'
 *          400:
 *              description: El cliente no existe
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          500:
 *              description: Error al borrar al cliente
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Errors'
 */
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Cliente.findByIdAndRemove(id, (err, clienteBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar cliente",
                errors: err,
            });
        }

        if (!clienteBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un cliente con este ID",
                errors: { message: "No existe un cliente con este ID" },
            });
        }

        res.status(200).json({
            ok: true,
            cliente: clienteBorrado,
        });
    });
});

//exportando modulo
module.exports = app;