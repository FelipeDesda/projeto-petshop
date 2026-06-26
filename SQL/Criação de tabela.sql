-- public.clientes definição

-- Drop table

-- DROP TABLE public.clientes;

CREATE TABLE public.clientes (
	id serial4 NOT NULL,
	nome_cliente varchar(100) NOT NULL,
	cpf varchar(14) NOT NULL,
	telefone varchar(20) NULL,
	email varchar(100) NULL,
	nome_animal varchar(100) NOT NULL,
	especie varchar(50) NOT NULL,
	raca varchar(100) NULL,
	idade_animal int4 NULL,
	data_cadastro timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	sexo_animal bpchar(1) NULL,
	veterinario_id int4 NULL,
	CONSTRAINT clientes_cpf_key UNIQUE (cpf),
	CONSTRAINT clientes_pkey PRIMARY KEY (id),
	CONSTRAINT clientes_sexo_animal_check CHECK ((sexo_animal = ANY (ARRAY['M'::bpchar, 'F'::bpchar])))
);
CREATE INDEX idx_clientes_cpf ON public.clientes USING btree (cpf);


-- public.clientes chaves estrangeiras

ALTER TABLE public.clientes ADD CONSTRAINT fk_veterinario FOREIGN KEY (veterinario_id) REFERENCES public.veterinarios(id);

-- public.veterinarios definição

-- Drop table

-- DROP TABLE public.veterinarios;

CREATE TABLE public.veterinarios (
	id serial4 NOT NULL,
	nome varchar(100) NOT NULL,
	crmv varchar(20) NOT NULL,
	telefone varchar(20) NULL,
	email varchar(100) NULL,
	CONSTRAINT veterinarios_crmv_key UNIQUE (crmv),
	CONSTRAINT veterinarios_pkey PRIMARY KEY (id)
);