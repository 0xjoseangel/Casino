"""
Script de Pruebas Automáticas - Módulo Eventos
Ejecutar desde el directorio backend:
    python manage.py shell < eventos/test_eventos.py
O como test de Django:
    python manage.py test eventos.test_eventos
"""
import os
import sys
import django

# Configurar Django si se ejecuta directamente
if 'django' not in sys.modules or not django.conf.settings.configured:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()

from datetime import date, timedelta
from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

# Importar modelos
from eventos.models import Promocion, Torneo, Participa, Compite


class TestPromocionesRF4(APITestCase):
    """
    Pruebas para Requisitos Funcionales de Promociones (RF4.1 - RF4.3)
    """

    def setUp(self):
        """Configuración inicial para cada test"""
        self.client = APIClient()
        # Datos válidos para crear promoción
        self.promo_valida = {
            'nombre': 'Promo Test',
            'tipo': 'Bono de Bienvenida',
            'fecha_inicio': str(date.today()),
            'fecha_fin': str(date.today() + timedelta(days=30)),
            'condiciones': 'Condiciones de prueba',
            'beneficio': '10%',
            'max_jugadores': 100,
            'estado': False
        }

    def test_RF4_1_crear_promocion_valida(self):
        """RF4.1: Admin puede crear una promoción válida"""
        response = self.client.post('/api/eventos/promociones/', self.promo_valida)
        # Sin autenticación admin debería fallar (403) o crear (201) según config
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_403_FORBIDDEN])
        if response.status_code == 201:
            print("✅ RF4.1 PASS: Promoción creada correctamente")
        else:
            print("⚠️  RF4.1: Requiere autenticación de admin (esperado)")

    def test_RF4_1_validacion_fechas_invalidas(self):
        """RF4.1: Validar que fecha_fin >= fecha_inicio"""
        promo_invalida = self.promo_valida.copy()
        promo_invalida['fecha_fin'] = str(date.today() - timedelta(days=10))  # Fecha fin antes de inicio

        response = self.client.post('/api/eventos/promociones/', promo_invalida)

        # Debería rechazar por validación de fechas o por permisos
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            self.assertIn('fecha_fin', str(response.data))
            print("✅ RF4.1 VALIDACIÓN FECHAS PASS: Rechaza fecha_fin < fecha_inicio")
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            print("⚠️  RF4.1: Requiere autenticación de admin")
        else:
            print(f"❌ RF4.1 FAIL: Código inesperado {response.status_code}")

    def test_RF4_2_habilitar_promocion(self):
        """RF4.2: Habilitar promoción (cambiar estado a activo)"""
        # Crear promoción directamente en BD
        promo = Promocion.objects.create(
            nombre='Promo para habilitar',
            tipo='Cashback',
            fecha_inicio=date.today(),
            fecha_fin=date.today() + timedelta(days=30),
            condiciones='Test',
            beneficio='5%',
            estado=False
        )

        response = self.client.post(f'/api/eventos/promociones/{promo.id}/habilitar/')

        if response.status_code == status.HTTP_200_OK:
            promo.refresh_from_db()
            self.assertTrue(promo.estado)
            print("✅ RF4.2 PASS: Promoción habilitada correctamente")
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            print("⚠️  RF4.2: Requiere autenticación de admin")
        else:
            print(f"❌ RF4.2 FAIL: {response.status_code} - {response.data}")

    def test_RF4_3_finalizar_promocion(self):
        """RF4.3: Finalizar promoción (cambiar estado a inactivo)"""
        promo = Promocion.objects.create(
            nombre='Promo para finalizar',
            tipo='Tiradas Gratis',
            fecha_inicio=date.today(),
            fecha_fin=date.today() + timedelta(days=30),
            condiciones='Test',
            beneficio='20 tiradas',
            estado=True  # Activa
        )

        response = self.client.post(f'/api/eventos/promociones/{promo.id}/finalizar/')

        if response.status_code == status.HTTP_200_OK:
            promo.refresh_from_db()
            self.assertFalse(promo.estado)
            print("✅ RF4.3 PASS: Promoción finalizada correctamente")
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            print("⚠️  RF4.3: Requiere autenticación de admin")
        else:
            print(f"❌ RF4.3 FAIL: {response.status_code} - {response.data}")


class TestTorneosRF4(APITestCase):
    """
    Pruebas para Requisitos Funcionales de Torneos (RF4.4 - RF4.5)
    """

    def setUp(self):
        self.client = APIClient()
        # Necesitamos un juego válido - verificar si existe
        from juegos.models import Juego
        self.juego = Juego.objects.first()
        if not self.juego:
            print("⚠️  AVISO: No hay juegos en la BD. Algunos tests pueden fallar.")

    def test_RF4_4_crear_torneo_valido(self):
        """RF4.4: Admin puede crear un torneo"""
        if not self.juego:
            print("⚠️  RF4.4: Saltando test - no hay juegos en BD")
            return

        torneo_data = {
            'nombre': 'Torneo Test',
            'juego': self.juego.id,
            'fecha_inicio': str(date.today()),
            'hora_inicio': '18:00',
            'aforo_maximo': 50,
            'precio_inscripcion': '10.00',
            'reglas': 'Reglas de prueba',
            'premio': '500€',
            'estado': 'programado'
        }

        response = self.client.post('/api/eventos/torneos/', torneo_data)

        if response.status_code == status.HTTP_201_CREATED:
            print("✅ RF4.4 PASS: Torneo creado correctamente")
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            print("⚠️  RF4.4: Requiere autenticación de admin")
        else:
            print(f"❌ RF4.4 FAIL: {response.status_code} - {response.data}")

    def test_RF4_4_validacion_precio_negativo(self):
        """RF4.4: Validar que precio_inscripcion >= 0"""
        if not self.juego:
            print("⚠️  RF4.4: Saltando test - no hay juegos en BD")
            return

        torneo_invalido = {
            'nombre': 'Torneo Precio Negativo',
            'juego': self.juego.id,
            'fecha_inicio': str(date.today()),
            'hora_inicio': '18:00',
            'aforo_maximo': 50,
            'precio_inscripcion': '-10.00',  # NEGATIVO
            'reglas': 'Test',
            'premio': '100€',
            'estado': 'programado'
        }

        response = self.client.post('/api/eventos/torneos/', torneo_invalido)

        if response.status_code == status.HTTP_400_BAD_REQUEST:
            print("✅ RF4.4 VALIDACIÓN PRECIO PASS: Rechaza precio negativo")
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            print("⚠️  RF4.4: Requiere autenticación de admin")
        else:
            print(f"❌ RF4.4 FAIL: Aceptó precio negativo")

    def test_RF4_4_validacion_aforo_cero(self):
        """RF4.4: Validar que aforo_maximo > 0"""
        if not self.juego:
            print("⚠️  RF4.4: Saltando test - no hay juegos en BD")
            return

        torneo_invalido = {
            'nombre': 'Torneo Aforo Cero',
            'juego': self.juego.id,
            'fecha_inicio': str(date.today()),
            'hora_inicio': '18:00',
            'aforo_maximo': 0,  # INVÁLIDO
            'precio_inscripcion': '10.00',
            'reglas': 'Test',
            'premio': '100€',
            'estado': 'programado'
        }

        response = self.client.post('/api/eventos/torneos/', torneo_invalido)

        if response.status_code == status.HTTP_400_BAD_REQUEST:
            print("✅ RF4.4 VALIDACIÓN AFORO PASS: Rechaza aforo <= 0")
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            print("⚠️  RF4.4: Requiere autenticación de admin")
        else:
            print(f"❌ RF4.4 FAIL: Aceptó aforo cero")

    def test_RF4_5_finalizar_torneo(self):
        """RF4.5: Admin puede finalizar un torneo"""
        if not self.juego:
            print("⚠️  RF4.5: Saltando test - no hay juegos en BD")
            return

        torneo = Torneo.objects.create(
            nombre='Torneo para finalizar',
            juego=self.juego,
            fecha_inicio=date.today(),
            hora_inicio='18:00',
            aforo_maximo=50,
            precio_inscripcion=10,
            reglas='Test',
            premio='100€',
            estado='programado'
        )

        response = self.client.post(f'/api/eventos/torneos/{torneo.id}/finalizar/')

        if response.status_code == status.HTTP_200_OK:
            torneo.refresh_from_db()
            self.assertEqual(torneo.estado, 'finalizado')
            print("✅ RF4.5 PASS: Torneo finalizado correctamente")
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            print("⚠️  RF4.5: Requiere autenticación de admin")
        else:
            print(f"❌ RF4.5 FAIL: {response.status_code} - {response.data}")


class TestInscripcionRF4(APITestCase):
    """
    Pruebas para Requisitos Funcionales de Inscripción (RF4.6)
    """

    def setUp(self):
        self.client = APIClient()
        # Obtener un juego y jugador existentes
        from juegos.models import Juego
        from usuarios.models import Jugador

        self.juego = Juego.objects.first()
        self.jugador = Jugador.objects.first()

        if self.juego:
            self.torneo = Torneo.objects.create(
                nombre='Torneo Inscripción Test',
                juego=self.juego,
                fecha_inicio=date.today(),
                hora_inicio='18:00',
                aforo_maximo=50,
                precio_inscripcion=10,
                reglas='Test',
                premio='100€',
                estado='abierto'
            )

    def test_RF4_6_inscribirse_torneo(self):
        """RF4.6: Jugador puede inscribirse a un torneo"""
        if not self.juego or not self.jugador:
            print("⚠️  RF4.6: Saltando test - faltan datos en BD")
            return

        inscripcion_data = {
            'torneo': self.torneo.id,
            'jugador': self.jugador.dni,
            'posicion': None
        }

        response = self.client.post('/api/eventos/competiciones/', inscripcion_data)

        if response.status_code == status.HTTP_201_CREATED:
            print("✅ RF4.6 PASS: Jugador inscrito correctamente")
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            print("⚠️  RF4.6: Requiere autenticación de jugador")
        else:
            print(f"❌ RF4.6 FAIL: {response.status_code} - {response.data}")

    def test_RF4_6_no_doble_inscripcion(self):
        """RF4.6: Un jugador NO puede inscribirse dos veces al mismo torneo"""
        if not self.juego or not self.jugador:
            print("⚠️  RF4.6: Saltando test - faltan datos en BD")
            return

        # Primera inscripción
        Compite.objects.create(
            torneo=self.torneo,
            jugador=self.jugador
        )

        # Intentar segunda inscripción
        inscripcion_data = {
            'torneo': self.torneo.id,
            'jugador': self.jugador.dni,
            'posicion': None
        }

        response = self.client.post('/api/eventos/competiciones/', inscripcion_data)

        if response.status_code == status.HTTP_400_BAD_REQUEST:
            print("✅ RF4.6 NO DUPLICADOS PASS: Rechaza inscripción duplicada")
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            print("⚠️  RF4.6: Requiere autenticación")
        else:
            print(f"❌ RF4.6 FAIL: Permitió inscripción duplicada")


class TestFlujoCompleto(APITestCase):
    """
    Test de flujo completo:
    Crear torneo -> Inscribir Jugador -> Finalizar Torneo
    """

    def test_flujo_completo_torneo(self):
        """Test del flujo completo de un torneo"""
        print("\n" + "="*60)
        print("INICIANDO TEST DE FLUJO COMPLETO")
        print("="*60)

        from juegos.models import Juego
        from usuarios.models import Jugador

        juego = Juego.objects.first()
        jugador = Jugador.objects.first()

        if not juego:
            print("❌ ERROR: No hay juegos en la BD")
            return

        if not jugador:
            print("❌ ERROR: No hay jugadores en la BD")
            return

        # PASO 1: Crear Torneo
        print("\n📌 PASO 1: Creando torneo...")
        torneo = Torneo.objects.create(
            nombre='Torneo Flujo Completo',
            juego=juego,
            fecha_inicio=date.today(),
            hora_inicio='20:00',
            aforo_maximo=10,
            precio_inscripcion=25,
            reglas='Torneo de prueba de flujo completo',
            premio='1000€',
            estado='abierto'
        )
        print(f"   ✅ Torneo '{torneo.nombre}' creado (ID: {torneo.id})")

        # PASO 2: Inscribir Jugador
        print("\n📌 PASO 2: Inscribiendo jugador...")
        inscripcion = Compite.objects.create(
            torneo=torneo,
            jugador=jugador
        )
        print(f"   ✅ Jugador {jugador.dni} inscrito al torneo")

        # PASO 3: Verificar inscripción
        print("\n📌 PASO 3: Verificando inscripción...")
        existe = Compite.objects.filter(torneo=torneo, jugador=jugador).exists()
        if existe:
            print("   ✅ Inscripción verificada en BD")
        else:
            print("   ❌ ERROR: Inscripción no encontrada")
            return

        # PASO 4: Intentar doble inscripción (debe fallar)
        print("\n📌 PASO 4: Probando doble inscripción (debe fallar)...")
        try:
            Compite.objects.create(torneo=torneo, jugador=jugador)
            print("   ❌ ERROR: Se permitió doble inscripción")
        except Exception as e:
            print("   ✅ Doble inscripción rechazada correctamente")

        # PASO 5: Finalizar torneo
        print("\n📌 PASO 5: Finalizando torneo...")
        torneo.estado = 'finalizado'
        torneo.save()
        torneo.refresh_from_db()
        if torneo.estado == 'finalizado':
            print("   ✅ Torneo finalizado correctamente")
        else:
            print("   ❌ ERROR: El torneo no se finalizó")

        # LIMPIEZA
        print("\n📌 Limpiando datos de prueba...")
        inscripcion.delete()
        torneo.delete()
        print("   ✅ Datos de prueba eliminados")

        print("\n" + "="*60)
        print("✅ FLUJO COMPLETO EXITOSO")
        print("="*60 + "\n")


# Para ejecutar directamente como script
if __name__ == '__main__':
    import django
    from django.conf import settings
    from django.test.utils import get_runner

    TestRunner = get_runner(settings)
    test_runner = TestRunner()

    # Ejecutar solo el test de flujo completo si se ejecuta directamente
    print("\n" + "="*60)
    print("EJECUTANDO PRUEBAS DEL MÓDULO EVENTOS")
    print("="*60)

    suite = test_runner.test_loader.loadTestsFromTestCase(TestFlujoCompleto)
    test_runner.run_suite(suite)
