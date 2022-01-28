const {Router} = require('express');
const {check} = require('express-validator');

const { crearProducto, 
        obtenerProducto, 
        obtenerProductos, 
        actualizarProducto,
        eliminarProducto} = require('../controllers/productos');
const { existeCategoriaPorId, existeProductoPorId } = require('../helpers/db-validators');
const { validarJWT, validarCampos, esAdminRole } = require('../middlewares');

const router = Router();

//Obtener todos los productos - publico
router.get('/', obtenerProductos)

//Obtener producto por id - publico
router.get('/:id', [
    check('id', 'No es un ID de MONGODB valido').isMongoId(),
    check('id').custom(existeProductoPorId),
    validarCampos
],obtenerProducto);


//Crear productos - Privado - Cualquier Rol
router.post('/', [
    validarJWT,
    check('nombre', 'El nombre del producto es obligatorio').not().isEmpty(),
    check('categoria', 'La categoria es obligatoria').not().isEmpty(),
    check('categoria', 'No es un id de Mongo valido').isMongoId(),
    check('categoria').custom(existeCategoriaPorId),
    validarCampos
],crearProducto);

//Actualizar categoria
router.put('/:id', [
    validarJWT,
    check('id', 'No es un ID de mongo valido').isMongoId(),
    check('id').custom(existeProductoPorId),
    check('categoria', 'ID de Categoria No es un id de Mongo valido').optional().isMongoId(),
    check('categoria').optional().custom(existeCategoriaPorId),
    validarCampos
],actualizarProducto);

//Borrar Categoria
router.delete('/:id', [
    validarJWT,
    esAdminRole,
    check('id', 'No es un ID de Mongo valido').isMongoId(),
    check('id').custom(existeProductoPorId),
    validarCampos
],eliminarProducto)







module.exports = router;