from flask import Blueprint, jsonify

praticante = Blueprint("praticante", __name__)

@praticante.route("/praticantes", methods=["GET"])
def listar_praticantes():
    return jsonify({"msg": "rota funcionando"})
