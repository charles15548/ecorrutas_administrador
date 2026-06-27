-- ============================================================
-- ECORUTA SMART
-- Sistema inteligente de recoleccion de residuos solidos
-- Municipalidad de Independencia, Lima
-- Base de datos PostgreSQL (compatible con Supabase Auth)
-- ============================================================
--
-- Mapeo de casos de uso (CU) a tablas:
--   CU01 Iniciar sesion              -> auth.users + usuarios
--   CU02 Gestionar usuarios          -> usuarios
--   CU03 Gestionar rutas             -> rutas, puntos_recoleccion
--   CU04 Asigna rutas                -> asignaciones_ruta
--   CU05 Monitorear recolectores     -> ubicaciones_recorrido
--   CU06 Gestionar reportes ciudadanos -> reportes_ciudadanos
--   CU07 Visualiza rutas asignadas   -> asignaciones_ruta
--   CU08 Selecciona/Inicia ruta      -> recorridos
--   CU09 Inspecciona alertas / Monitorea recorrido -> alertas, ubicaciones_recorrido
--   CU10 Emite alerta                -> alertas
--   CU11 Atiende alerta              -> alertas (atendido_por, respuesta)
--   CU12 Consulta estado alerta      -> reportes_ciudadanos.estado
-- ============================================================


-- ------------------------------------------------------------
-- EXTENSIONES
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ------------------------------------------------------------
-- TIPOS ENUMERADOS
-- ------------------------------------------------------------

-- 3 tipos de usuario del sistema (segun diagrama de casos de uso)
CREATE TYPE rol_usuario AS ENUM (
    'administrador_municipal',
    'conductor',
    'vecino'
);

CREATE TYPE estado_ruta AS ENUM ('activa', 'inactiva', 'en_revision');

CREATE TYPE estado_asignacion AS ENUM ('pendiente', 'en_curso', 'finalizada', 'cancelada');

CREATE TYPE estado_recorrido AS ENUM ('no_iniciado', 'en_curso', 'pausado', 'finalizado');

CREATE TYPE tipo_alerta AS ENUM ('mecanica', 'obstaculo', 'incidente', 'otro');

CREATE TYPE estado_alerta AS ENUM ('pendiente', 'atendida', 'descartada');

CREATE TYPE tipo_residuo AS ENUM ('domiciliario', 'reciclable', 'organico', 'voluminoso', 'peligroso');

CREATE TYPE estado_reporte AS ENUM ('recibido', 'en_proceso', 'resuelto', 'rechazado');


-- ------------------------------------------------------------
-- TABLA: usuarios
-- CU01 Iniciar sesion (Administrador_Municipal, Conductor, Vecino)
-- CU02 Gestionar usuarios (Administrador)
-- ------------------------------------------------------------
-- "id" referencia auth.users de Supabase. Si no se usa Supabase Auth,
-- reemplazar por: id UUID PRIMARY KEY DEFAULT gen_random_uuid()
CREATE TABLE usuarios (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombres         VARCHAR(100) NOT NULL,
    apellidos       VARCHAR(100) NOT NULL,
    dni             VARCHAR(15) UNIQUE,
    telefono        VARCHAR(20),
    correo          VARCHAR(150) UNIQUE NOT NULL,
    direccion       VARCHAR(255),
    rol             rol_usuario NOT NULL DEFAULT 'vecino',
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_usuarios_rol ON usuarios(rol);


-- ------------------------------------------------------------
-- TABLA: zonas
-- Sectores de recoleccion del distrito de Independencia
-- (apoyo para rutas y reportes ciudadanos)
-- ------------------------------------------------------------
CREATE TABLE zonas (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ------------------------------------------------------------
-- TABLA: vehiculos
-- Vehiculos recolectores que se asignan a los conductores
-- ------------------------------------------------------------
CREATE TABLE vehiculos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placa           VARCHAR(10) UNIQUE NOT NULL,
    tipo            VARCHAR(50),
    capacidad_kg    NUMERIC(10,2),
    estado          VARCHAR(30) NOT NULL DEFAULT 'operativo',
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ------------------------------------------------------------
-- TABLA: rutas
-- CU03 Gestionar rutas (Administrador)
-- ------------------------------------------------------------
CREATE TABLE rutas (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre                  VARCHAR(100) NOT NULL,
    descripcion             TEXT,
    zona_id                 UUID REFERENCES zonas(id) ON DELETE SET NULL,
    tipo_residuo            tipo_residuo NOT NULL DEFAULT 'domiciliario',
    distancia_km            NUMERIC(10,2),
    duracion_estimada_min   INTEGER,
    geometria               JSONB,        -- GeoJSON con el trazado de la ruta
    estado                  estado_ruta NOT NULL DEFAULT 'activa',
    creado_por              UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en               TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rutas_zona ON rutas(zona_id);
CREATE INDEX idx_rutas_estado ON rutas(estado);


-- ------------------------------------------------------------
-- TABLA: puntos_recoleccion
-- Paradas/puntos ordenados que componen una ruta
-- (parte de CU03 Gestionar rutas)
-- ------------------------------------------------------------
CREATE TABLE puntos_recoleccion (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ruta_id     UUID NOT NULL REFERENCES rutas(id) ON DELETE CASCADE,
    nombre      VARCHAR(100),
    direccion   VARCHAR(255),
    latitud     NUMERIC(10,7) NOT NULL,
    longitud    NUMERIC(10,7) NOT NULL,
    orden       INTEGER NOT NULL,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (ruta_id, orden)
);

CREATE INDEX idx_puntos_ruta ON puntos_recoleccion(ruta_id);


-- ------------------------------------------------------------
-- TABLA: asignaciones_ruta
-- CU04 Asigna rutas (Administrador -> Conductor)
-- CU07 Visualiza rutas asignadas (Conductor)
-- ------------------------------------------------------------
CREATE TABLE asignaciones_ruta (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ruta_id             UUID NOT NULL REFERENCES rutas(id) ON DELETE CASCADE,
    conductor_id        UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    vehiculo_id         UUID REFERENCES vehiculos(id) ON DELETE SET NULL,
    fecha_asignacion    DATE NOT NULL DEFAULT CURRENT_DATE,
    turno               VARCHAR(20),     -- mañana, tarde, noche
    estado              estado_asignacion NOT NULL DEFAULT 'pendiente',
    asignado_por        UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_asignaciones_conductor ON asignaciones_ruta(conductor_id);
CREATE INDEX idx_asignaciones_fecha ON asignaciones_ruta(fecha_asignacion);


-- ------------------------------------------------------------
-- TABLA: recorridos
-- CU08 Selecciona ruta / Inicia ruta (Conductor)
-- CU09 Monitorea recorrido (Conductor)
-- ------------------------------------------------------------
CREATE TABLE recorridos (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asignacion_id           UUID NOT NULL REFERENCES asignaciones_ruta(id) ON DELETE CASCADE,
    conductor_id            UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    ruta_id                 UUID NOT NULL REFERENCES rutas(id) ON DELETE CASCADE,
    estado                  estado_recorrido NOT NULL DEFAULT 'no_iniciado',
    hora_inicio             TIMESTAMPTZ,
    hora_fin                TIMESTAMPTZ,
    distancia_recorrida_km  NUMERIC(10,2),
    creado_en               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recorridos_conductor ON recorridos(conductor_id);
CREATE INDEX idx_recorridos_estado ON recorridos(estado);


-- ------------------------------------------------------------
-- TABLA: ubicaciones_recorrido
-- CU05 Monitorear recolectores (Administrador, tiempo real)
-- CU09 Monitorea recorrido (Conductor)
-- ------------------------------------------------------------
CREATE TABLE ubicaciones_recorrido (
    id              BIGSERIAL PRIMARY KEY,
    recorrido_id    UUID NOT NULL REFERENCES recorridos(id) ON DELETE CASCADE,
    latitud         NUMERIC(10,7) NOT NULL,
    longitud        NUMERIC(10,7) NOT NULL,
    velocidad_kmh   NUMERIC(6,2),
    registrado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ubicaciones_recorrido ON ubicaciones_recorrido(recorrido_id, registrado_en);


-- ------------------------------------------------------------
-- TABLA: alertas
-- CU10 Emite alerta (Conductor)
-- CU09 Inspecciona alertas «include» CU11 Atiende alerta (Administrador)
-- ------------------------------------------------------------
CREATE TABLE alertas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recorrido_id    UUID REFERENCES recorridos(id) ON DELETE CASCADE,
    emitido_por     UUID NOT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    tipo            tipo_alerta NOT NULL DEFAULT 'otro',
    descripcion     TEXT NOT NULL,
    latitud         NUMERIC(10,7),
    longitud        NUMERIC(10,7),
    estado          estado_alerta NOT NULL DEFAULT 'pendiente',
    atendido_por    UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    respuesta       TEXT,
    emitida_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
    atendida_en     TIMESTAMPTZ
);

CREATE INDEX idx_alertas_estado ON alertas(estado);
CREATE INDEX idx_alertas_recorrido ON alertas(recorrido_id);


-- ------------------------------------------------------------
-- TABLA: reportes_ciudadanos
-- CU06 Gestionar reportes ciudadanos (Administrador)
-- CU12 Consulta estado alerta «extend» (Vecino)
-- ------------------------------------------------------------
CREATE TABLE reportes_ciudadanos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vecino_id       UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    zona_id         UUID REFERENCES zonas(id) ON DELETE SET NULL,
    titulo          VARCHAR(150) NOT NULL,
    descripcion     TEXT NOT NULL,
    tipo_residuo    tipo_residuo,
    latitud         NUMERIC(10,7),
    longitud        NUMERIC(10,7),
    foto_url        TEXT,
    estado          estado_reporte NOT NULL DEFAULT 'recibido',
    atendido_por    UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    respuesta_admin TEXT,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reportes_vecino ON reportes_ciudadanos(vecino_id);
CREATE INDEX idx_reportes_estado ON reportes_ciudadanos(estado);


-- ------------------------------------------------------------
-- TRIGGERS: actualizar timestamp "actualizado_en"
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_rutas_updated
    BEFORE UPDATE ON rutas
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_reportes_updated
    BEFORE UPDATE ON reportes_ciudadanos
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();


-- ------------------------------------------------------------
-- TRIGGER: crear fila en "usuarios" al registrarse en Supabase Auth
-- (omitir este bloque si no se usa Supabase Auth)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION crear_usuario_publico()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, nombres, apellidos, correo, rol)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombres', ''),
        COALESCE(NEW.raw_user_meta_data->>'apellidos', ''),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'rol')::rol_usuario, 'vecino')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION crear_usuario_publico();


-- ============================================================
-- ROW LEVEL SECURITY (Supabase)
-- ============================================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE rutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE puntos_recoleccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones_ruta ENABLE ROW LEVEL SECURITY;
ALTER TABLE recorridos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ubicaciones_recorrido ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_ciudadanos ENABLE ROW LEVEL SECURITY;

-- Helper: obtiene el rol del usuario autenticado
CREATE OR REPLACE FUNCTION auth_rol()
RETURNS rol_usuario AS $$
    SELECT rol FROM usuarios WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- usuarios: cada uno ve/edita su perfil; el admin ve y gestiona todos
CREATE POLICY usuarios_select ON usuarios
    FOR SELECT USING (id = auth.uid() OR auth_rol() = 'administrador_municipal');

CREATE POLICY usuarios_update_propio ON usuarios
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY usuarios_admin_all ON usuarios
    FOR ALL USING (auth_rol() = 'administrador_municipal');

-- rutas: lectura para conductor y admin; escritura solo admin
CREATE POLICY rutas_select ON rutas
    FOR SELECT USING (auth_rol() IN ('administrador_municipal', 'conductor'));

CREATE POLICY rutas_admin_write ON rutas
    FOR ALL USING (auth_rol() = 'administrador_municipal');

-- puntos_recoleccion: mismo criterio que rutas
CREATE POLICY puntos_select ON puntos_recoleccion
    FOR SELECT USING (auth_rol() IN ('administrador_municipal', 'conductor'));

CREATE POLICY puntos_admin_write ON puntos_recoleccion
    FOR ALL USING (auth_rol() = 'administrador_municipal');

-- asignaciones_ruta: conductor ve solo las suyas; admin gestiona todas
CREATE POLICY asignaciones_select ON asignaciones_ruta
    FOR SELECT USING (conductor_id = auth.uid() OR auth_rol() = 'administrador_municipal');

CREATE POLICY asignaciones_admin_write ON asignaciones_ruta
    FOR ALL USING (auth_rol() = 'administrador_municipal');

-- recorridos: el conductor gestiona los suyos; admin solo lectura (monitoreo)
CREATE POLICY recorridos_conductor ON recorridos
    FOR ALL USING (conductor_id = auth.uid());

CREATE POLICY recorridos_admin_select ON recorridos
    FOR SELECT USING (auth_rol() = 'administrador_municipal');

-- ubicaciones_recorrido: el conductor inserta las suyas; admin monitorea
CREATE POLICY ubicaciones_insert ON ubicaciones_recorrido
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM recorridos r
            WHERE r.id = recorrido_id AND r.conductor_id = auth.uid()
        )
    );

CREATE POLICY ubicaciones_select ON ubicaciones_recorrido
    FOR SELECT USING (
        auth_rol() = 'administrador_municipal'
        OR EXISTS (
            SELECT 1 FROM recorridos r
            WHERE r.id = recorrido_id AND r.conductor_id = auth.uid()
        )
    );

-- alertas: conductor crea/ve las suyas; admin ve y atiende todas
CREATE POLICY alertas_conductor_insert ON alertas
    FOR INSERT WITH CHECK (emitido_por = auth.uid());

CREATE POLICY alertas_select ON alertas
    FOR SELECT USING (emitido_por = auth.uid() OR auth_rol() = 'administrador_municipal');

CREATE POLICY alertas_admin_update ON alertas
    FOR UPDATE USING (auth_rol() = 'administrador_municipal');

-- reportes_ciudadanos: el vecino gestiona los suyos; admin ve y atiende todos
CREATE POLICY reportes_vecino ON reportes_ciudadanos
    FOR ALL USING (vecino_id = auth.uid());

CREATE POLICY reportes_admin ON reportes_ciudadanos
    FOR ALL USING (auth_rol() = 'administrador_municipal');