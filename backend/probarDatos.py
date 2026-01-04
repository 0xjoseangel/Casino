import os
import django
import random
from datetime import date, timedelta
from django.utils import timezone

# 1. Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'casino_project.settings')
django.setup()

# 2. Importar tus modelos
from usuarios.models import Jugador, Administrador
from juegos.models import Juego
from eventos.models import Torneo, Participa
from transacciones.models import Transaccion, Apuesta 
# NOTA: Si da error 'sesiones', asegúrate de tener la app o comenta la línea de sesión en Apuesta más abajo

print("🎰 INICIANDO GENERACIÓN DE DATOS REALES (FULL VERSION) 🎰")
print("-" * 50)

# --- DATOS AUXILIARES ---
NOMBRES = ["Ana", "Borja", "Carlos", "Diana", "Elena", "Fernando", "Gema", "Hugo", "Irene", "Javier"]
APELLIDOS = ["García", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Ruiz", "Hernández"]
CALLES = ["Calle Mayor", "Avda. Constitución", "Plaza España", "C/ Pez", "Paseo Marítimo"]

def generar_dni():
    num = random.randint(10000000, 99999999)
    letra = random.choice('TRWAGMYFPDXBNJZSQVHLCKE')
    return f"{num}{letra}"

def crear_juegos():
    print("🎲 Creando juegos...")
    lista = [
        ("Póker Texas", "cartas"),
        ("Ruleta Americana", "ruleta"),
        ("Blackjack", "cartas"),
        ("Slots Fortuna", "slots")
    ]
    objs = []
    for nombre, tipo in lista:
        j, _ = Juego.objects.get_or_create(
            nombre=nombre,
            defaults={'tipo': tipo, 'apuesta_minima': 5, 'apuesta_maxima': 500, 'estado': True}
        )
        objs.append(j)
    return objs

def crear_usuarios():
    print("👤 Creando Jugadores y Administradores...")
    jugadores = []

    # 1. JUGADOR VIP
    vip, _ = Jugador.objects.get_or_create(
        dni="12345678X",
        defaults={
            'nombre': "Jugador", 'apellidos': "Pruebas", 'email': "vip@casino.com",
            'direccion': "Calle Falsa 123", 'telefono': 600123456,
            'fecha_nacimiento': date(1990, 5, 15), 'contrasena': "1234",
            'cartera_monetaria': 5000, 'baja': False
        }
    )
    jugadores.append(vip)

    # 2. ADMIN JEFE
    Administrador.objects.get_or_create(
        dni="88888888A",
        defaults={
            'nombre': "Jefe", 'apellidos': "Supremo", 'email': "admin@casino.com",
            'direccion': "Despacho 1", 'telefono': 600999999,
            'fecha_nacimiento': date(1980, 1, 1), 'contrasena': "admin123", 'baja': False
        }
    )

    # 3. JUGADORES RANDOM
    for i in range(30):
        dni = generar_dni()
        try:
            j = Jugador.objects.create(
                dni=dni,
                nombre=random.choice(NOMBRES),
                apellidos=f"{random.choice(APELLIDOS)} {random.choice(APELLIDOS)}",
                email=f"user{i}_{dni}@test.com",
                direccion=f"{random.choice(CALLES)}, {random.randint(1, 100)}",
                telefono=random.randint(600000000, 799999999),
                fecha_nacimiento=date(random.randint(1970, 2005), 1, 1),
                contrasena="1234",
                cartera_monetaria=random.randint(0, 2000),
                baja=False
            )
            jugadores.append(j)
        except Exception:
            pass
            
    return jugadores

def crear_torneos_y_participantes(juegos, jugadores):
    print("🏆 Creando Torneos e Inscripciones...")
    for i in range(10):
        juego = random.choice(juegos)
        dias = random.randint(-10, 30)
        fecha_ini = timezone.now().date() + timedelta(days=dias)
        
        estado = "programado"
        if dias < 0: estado = "finalizado"
        elif dias == 0: estado = "abierto"

        t = Torneo.objects.create(
            nombre=f"Torneo {juego.nombre} #{i+1}",
            juego=juego,
            fecha_inicio=fecha_ini,
            hora_inicio="18:00",
            precio_inscripcion=random.choice([10, 20, 50]),
            aforo_maximo=50,
            premio="1000",
            estado=estado,
            reglas="Reglas estándar"
        )

        if estado in ["programado", "abierto", "finalizado"]:
            num = random.randint(3, 10)
            inscritos = random.sample(jugadores, min(len(jugadores), num))
            for p in inscritos:
                try:
                    Participa.objects.create(
                        torneo=t, jugador=p,
                        fecha_inscripcion=timezone.now(),
                        posicion=random.randint(1, 50) if estado == "finalizado" else None
                    )
                except Exception: pass

def crear_transacciones_y_apuestas(jugadores, juegos):
    print("💸 Generando flujo de dinero (Transacciones y Apuestas)...")
    
    # 1. TRANSACCIONES (Depósitos, Retiros, Transferencias)
    metodos = ["Visa 1234", "Mastercard 9999", "Paypal", "Bizum"]
    
    for jugador in jugadores:
        # Crear 3 transacciones aleatorias por jugador
        for _ in range(3):
            tipo = random.choice(['DEPOSITO', 'RETIRO', 'TRANSFERENCIA'])
            cantidad = random.randint(10, 500)
            destinatario = None
            
            if tipo == 'TRANSFERENCIA':
                # Elegir otro jugador al azar que no sea él mismo
                posibles = [j for j in jugadores if j.dni != jugador.dni]
                if posibles:
                    destinatario = random.choice(posibles)
                else:
                    tipo = 'DEPOSITO' # Fallback
            
            Transaccion.objects.create(
                usuario=jugador,
                destinatario=destinatario,
                tipo=tipo,
                cantidad=cantidad,
                fecha=timezone.now() - timedelta(days=random.randint(0, 60)),
                estado='COMPLETADO',
                metodo_pago=random.choice(metodos) if tipo != 'TRANSFERENCIA' else None
            )

    # 2. APUESTAS (Jugar)
    for jugador in jugadores:
        # Cada jugador echa unas 5 partidas
        for _ in range(5):
            juego = random.choice(juegos)
            apostado = random.randint(5, 100)
            
            # Simular Resultado (40% ganar, 60% perder)
            gano = random.choice([True, False, False]) 
            ganancia = apostado * 2 if gano else 0
            resultado = "Victoria" if gano else "Derrota"
            
            Apuesta.objects.create(
                usuario=jugador,
                juego=juego,
                sesion=None, # Dejamos esto en blanco si no tenemos sesiones creadas aún
                fecha=timezone.now() - timedelta(minutes=random.randint(1, 5000)),
                cantidad_apostada=apostado,
                ganancia=ganancia,
                resultado=resultado
            )

if __name__ == '__main__':
    try:
        juegos = crear_juegos()
        jugadores = crear_usuarios()
        crear_torneos_y_participantes(juegos, jugadores)
        crear_transacciones_y_apuestas(jugadores, juegos) # <--- NUEVA FUNCIÓN AÑADIDA
        
        print("-" * 50)
        print("✅ ¡BASE DE DATOS POBLADA CON ÉXITO!")
        print("   -> Usuarios, Juegos, Torneos, Inscripciones, Transacciones y Apuestas creadas.")
        print("🔑 Usuario JUGADOR para probar: 12345678X / pass: 1234")
        print("🔑 Usuario ADMIN para probar:   88888888A / pass: admin123")
        print("-" * 50)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("Asegúrate de haber hecho 'python manage.py migrate' antes.")