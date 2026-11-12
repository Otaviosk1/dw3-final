-- Extensão para criptografia de senha
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remove as tabelas existentes para recriar do zero
DROP TABLE IF EXISTS alocado CASCADE;
DROP TABLE IF EXISTS piquete CASCADE;
DROP TABLE IF EXISTS animal CASCADE;
DROP TABLE IF EXISTS pasto CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Tabela de Usuários
CREATE TABLE usuarios (
    usuarioid bigserial CONSTRAINT pk_usuarios PRIMARY KEY,
    username varchar(10) UNIQUE NOT NULL,
    password text NOT NULL,
    removido boolean DEFAULT false
);

-- Tabela de Pastos
CREATE TABLE pasto (
    pastoid bigserial CONSTRAINT pk_pasto PRIMARY KEY,
    descricao varchar(60) NOT NULL,
    areatotal numeric(10, 2) NOT NULL,
    removido boolean DEFAULT false
);

-- Tabela de Piquetes
CREATE TABLE piquete (
    piqueteid bigserial CONSTRAINT pk_piquete PRIMARY KEY,
    descricao varchar(60) NOT NULL,
    latitude numeric(10, 6) NOT NULL,
    longitude numeric(10, 6) NOT NULL,
    pastoidfk bigint NOT NULL CONSTRAINT fk_piquete_pasto REFERENCES pasto (pastoid),
    removido boolean DEFAULT false
);

-- Tabela de Animais
CREATE TABLE animal (
    animalid bigserial CONSTRAINT pk_animal PRIMARY KEY,
    nome varchar(60) NOT NULL,
    datanasc date NOT NULL,
    removido boolean DEFAULT false
);

-- Tabela de Alocações (N:N entre Animal e Piquete)
CREATE TABLE alocado (
    alocadoid bigserial CONSTRAINT pk_alocado PRIMARY KEY,
    animalidfk bigint NOT NULL CONSTRAINT fk_alocado_animal REFERENCES animal (animalid),
    piqueteidfk bigint NOT NULL CONSTRAINT fk_alocado_piquete REFERENCES piquete (piqueteid),
    datainicio date NOT NULL,
    datafinal date,
    removido boolean DEFAULT false
);

-- Usuário padrão para autenticação (login: qwe | senha: qwe)
INSERT INTO usuarios VALUES (default, 'qwe', crypt('qwe', gen_salt('bf')), false);

-- Carga inicial de Pastos (IDs 1, 2 e 3)
INSERT INTO pasto VALUES
    (default, 'Pasto Norte', 120.50, false),
    (default, 'Pasto Sul', 85.75, false),
    (default, 'Pasto Leste', 60.00, false);

-- Carga inicial de Piquetes (IDs 1, 2 e 3)
INSERT INTO piquete VALUES
    (default, 'Piquete A1', -20.422550, -49.972850, 1, false),
    (default, 'Piquete A2', -20.423100, -49.973200, 1, false),
    (default, 'Piquete B1', -20.425100, -49.975400, 2, false);

-- Carga inicial de Animais (IDs 1, 2 e 3)
INSERT INTO animal VALUES
    (default, 'Mimosa', '2022-05-14', false),
    (default, 'Touro Bandido', '2021-08-20', false),
    (default, 'Estrela', '2023-04-10', false);

-- Carga inicial de Alocações (IDs 1 e 2)
INSERT INTO alocado VALUES
    (default, 1, 1, '2026-10-01', '2026-10-30', false),
    (default, 2, 3, '2026-11-01', NULL, false);