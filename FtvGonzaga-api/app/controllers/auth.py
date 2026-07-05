from app.models.usuarios import Usuario
from app.extensions import db
import bcrypt

def criar_usuario_admin(username, password):
    # Verifica se já existe
    usuario = Usuario.query.filter_by(username=username).first()
    if usuario:
        return usuario
        
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    novo_admin = Usuario(
        username=username,
        password_hash=password_hash.decode('utf-8')
    )
    
    db.session.add(novo_admin)
    db.session.commit()
    return novo_admin

def verificar_login(username, password):
    usuario = Usuario.query.filter_by(username=username).first()
    if not usuario:
        return None
        
    if bcrypt.checkpw(password.encode('utf-8'), usuario.password_hash.encode('utf-8')):
        return usuario
        
    return None
