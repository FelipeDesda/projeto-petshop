CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome_cliente VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    nome_animal VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raca VARCHAR(100),
    idade_animal INTEGER,
    sexo_animal CHAR(1) CHECK (sexo_animal IN ('M', 'F')),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);