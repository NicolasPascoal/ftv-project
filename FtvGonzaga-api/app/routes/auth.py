from flask import Blueprint, request, jsonify
from app.controllers.auth import verificar_login, criar_usuario_admin
from flask_jwt_extended import create_access_token, jwt_required
from datetime import timedelta

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login_route():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"erro": "Usuário e senha são obrigatórios"}), 400

    usuario = verificar_login(username, password)
    
    if not usuario:
        return jsonify({"erro": "Credenciais inválidas"}), 401

    # Cria o token com validade de 7 dias
    expires = timedelta(days=7)
    access_token = create_access_token(identity=str(usuario.id), expires_delta=expires)
    
    return jsonify({
        "msg": "Login efetuado com sucesso",
        "token": access_token,
        "username": usuario.username
    }), 200

@auth_bp.route("/auth/usuarios", methods=["POST"])
@jwt_required()
def criar_usuario_route():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"erro": "Usuário e senha são obrigatórios"}), 400

    usuario = criar_usuario_admin(username, password)
    return jsonify({"msg": f"Usuário '{usuario.username}' criado com sucesso!"}), 201
