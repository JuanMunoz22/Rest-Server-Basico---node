const bcryptjs = require("bcryptjs");
const { response } = require("express");
const { json } = require("express/lib/response");

const { generarJWT } = require("../helpers/generar-jwt");
const { googleVerify } = require("../helpers/google-verify");
const Usuario = require('../models/usuario');

const login = async(req, res = response) => {

    const {correo, password} = req.body;

    try {
        //Verificar si el email existe
        const usuario = await Usuario.findOne({correo});
        if(!usuario){
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos * Email'
            })
        }

        //Verificar si usuario esta activo
        if(!usuario.estado){
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos * estado'
            })            
        }

        //Verificar contraseña
        const validPassword = bcryptjs.compareSync(password, usuario.password);
        if(!validPassword){
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos * password'
            })                
        }

        //Generar el JWT
        const token = await generarJWT(usuario.id);

        res.json({
            usuario,
            token
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

const googleSignIn = async(req, res = response) => {

    const {id_token} = req.body;

    try {
        const {nombre, img, correo} = await googleVerify(id_token);
    
        let usuario = await Usuario.findOne({correo});

        if(!usuario){
            //Crear usuario
            const data = {
                nombre,
                correo,
                password: '123',
                img,
                rol: 'ADMIN_ROLE',
                google: true
            };

            usuario = new Usuario(data);
            await usuario.save();
        }

        //Si el usuario en DB 
        if(!usuario.estado){
            return res.status(401).json({
                msg: 'Hable con el administrador, usuario bloqueado'
            });
        }

        //Generar el JWT
        const token = await generarJWT(usuario.id);

        res.json({
            usuario,
            token
        });

    } catch (error) {
        res.status(400).json({
            ok: false,
            msg: 'El token no se pudo verificar - Google'
        })
    }

}

module.exports = {
    login,
    googleSignIn
}