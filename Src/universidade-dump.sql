/*
O comando SQL que gerou o esquema de tabelas que o crud deve gerenciar.
Apenas para observação, lembrar de remover dos arquivos do projeto ao final.
*/

CREATE SCHEMA universidade;

-- Domínios compartilhados pelas tabelas mantidas
CREATE DOMAIN universidade.matricula AS VARCHAR(7);
CREATE DOMAIN universidade.tipo_cpf AS NUMERIC(13);

-- Tabela: usuario
CREATE TABLE universidade.usuario(
	cpf universidade.tipo_cpf,
	nome	VARCHAR(100) NOT NULL,
	data_nascimento DATE,
	email VARCHAR[],
	telefone VARCHAR[],
	login VARCHAR(45) UNIQUE,
	senha VARCHAR(32),
	CONSTRAINT pk_usuario PRIMARY KEY (cpf)
);

-- Tipos enumerados utilizados pela tabela curso
CREATE TYPE universidade.tipo_grau AS ENUM ('Bacharelado', 'Licenciatura Plena');
CREATE TYPE universidade.tipo_nivel AS ENUM ('Graduação', 'Mestrado', 'Doutorado', 'Lato');
CREATE TYPE universidade.tipo_turno AS ENUM ('Matutino', 'Vespertino', 'Noturno', 'Turno Indefinido');

-- Tabela: curso
CREATE TABLE universidade.curso(
	idCurso SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	grau universidade.tipo_grau,
	turno universidade.tipo_turno NOT NULL,
	campus VARCHAR(100),
	nivel universidade.tipo_nivel,
	CONSTRAINT uq_curso UNIQUE(nome, turno, campus, nivel)
);

-- Tabela: estudante
CREATE TABLE universidade.estudante(
	mat_estudante universidade.matricula,
	cpf  universidade.tipo_cpf ,
	MC DECIMAL(2),
	ano_ingresso INT,

	CONSTRAINT pk_estudante PRIMARY KEY(mat_estudante),
	CONSTRAINT fk_usuario FOREIGN KEY (cpf) REFERENCES universidade.usuario(cpf)
	ON DELETE SET NULL ON UPDATE CASCADE,
	CONSTRAINT uq_cpf UNIQUE(cpf)
);

-- Tipo enumerado utilizado pela tabela vinculo
CREATE TYPE universidade.status_estudante AS ENUM ('Ativo', 'Cancelada', 'Formando', 'Graduado');

-- Tabela: vinculo
CREATE TABLE universidade.vinculo(
	idVinculo SERIAL PRIMARY KEY,
	mat_estudante universidade.matricula,
	curso INT,
	data_entrada DATE,
	status universidade.status_estudante,
	data_saida DATE,
	CONSTRAINT fk_curso FOREIGN KEY (curso) REFERENCES universidade.curso(idCurso)
	ON DELETE SET NULL ON UPDATE CASCADE,
	CONSTRAINT fk_estudabte FOREIGN KEY (mat_estudante) REFERENCES universidade.estudante(mat_estudante)
	ON DELETE SET NULL ON UPDATE CASCADE
);

-- Usuários (Apenas os que são estudantes)
INSERT INTO universidade.usuario VALUES ('22222222201', 'Steve Jobs', '1990/03/05', '{"steve@email.com","steve@apple.com"}', NULL,'steve','s1');
INSERT INTO universidade.usuario VALUES ('22222222202', 'Paul Bell', '1999/09/15', '{bell@email.com}', NULL,'paul','s2');
INSERT INTO universidade.usuario VALUES ('22222222203', 'Alan Turing', '1912/07/23', NULL,NULL,'alan', 's3');
INSERT INTO universidade.usuario VALUES ('22222222204', 'John Hopcroft', '1939/10/07', '{"hopcroft@lfc.com"}',NULL,'john','s4');
INSERT INTO universidade.usuario VALUES ('22222222205', 'Ada Lovelace', '1985/11/27', NULL, NULL,'ada','s5');
INSERT INTO universidade.usuario VALUES ('22222222206', 'Grace Hooper', '1996/12/10', '{"hooper@linguagens.com"}',NULL, 'grace','s5');
INSERT INTO universidade.usuario VALUES ('22222222207', 'Charles Babbage', '1971/12/26', NULL, NULL,'charles', 's6');
INSERT INTO universidade.usuario VALUES ('22222222208', 'Musa al-Khwarizmi',  '1950/12/26', NULL, NULL, 'musa', 's7');
INSERT INTO universidade.usuario VALUES ('22222222209', 'Cesar Lattes',  '1924/06/11', '{"cesar@cnpq.com", "lattes@curriculo.com"}',NULL, 'lattes', 's8');
INSERT INTO universidade.usuario VALUES ('22222222210', 'Donald Knuth', '1938/01/10', '{"knuth@algorithms.com"}',NULL, 'knuth','s9');
INSERT INTO universidade.usuario VALUES ('22222222211', 'Abraham Silberschatz',  '1956/01/10', '{"silberchatz@sgbd.com"}',NULL, 'abraham','s10');
INSERT INTO universidade.usuario VALUES ('22222222212', 'Elmasri Navathe',  '1944/03/24', NULL, NULL,'elmasri', 's11');
INSERT INTO universidade.usuario VALUES ('22222222213', 'Ramakrishnam Raghu',  '1965/08/22', NULL, NULL, 'raghu','s12');

-- Estudantes
INSERT INTO universidade.estudante VALUES('E101', '22222222201', 7.0, 2021);
INSERT INTO universidade.estudante VALUES('E102', '22222222202', 8.3, 2021);
INSERT INTO universidade.estudante VALUES('E103', '22222222203', 6.7, 2021);
INSERT INTO universidade.estudante VALUES('E104', '22222222204', 0, 2021);
INSERT INTO universidade.estudante VALUES('E105', '22222222205', 9, 2022);
INSERT INTO universidade.estudante VALUES('E106', '22222222206', 7.7, 2022);
INSERT INTO universidade.estudante VALUES('E107', '22222222207', 5.5, 2022);
INSERT INTO universidade.estudante VALUES('E108', '22222222208', 6.5, 2023);
INSERT INTO universidade.estudante VALUES('E109', '22222222209', 6.0, 2023);
INSERT INTO universidade.estudante VALUES('E110', '22222222210', 2.1, 2023);
INSERT INTO universidade.estudante VALUES('E111', '22222222211', 3.3, 2023);
INSERT INTO universidade.estudante VALUES('E112', '22222222212', 4.5, 2024);
INSERT INTO universidade.estudante VALUES('E113', '22222222213', 8.1, 2024);

-- Cursos
INSERT INTO universidade.curso VALUES (1,'Ciência da Computação', 'Bacharelado', 'Vespertino', 'São Cristóvão', 'Graduação');
INSERT INTO universidade.curso VALUES (2,'Sistemas de Informação', 'Bacharelado', 'Noturno', 'São Cristóvão', 'Graduação');
INSERT INTO universidade.curso VALUES (3,'Sistemas de Informação', 'Bacharelado', 'Matutino', 'Itabaiana', 'Graduação');
INSERT INTO universidade.curso VALUES (4,'Engenharia de Computação', 'Bacharelado', 'Vespertino', 'São Cristóvão', 'Graduação');
INSERT INTO universidade.curso VALUES (5,'Inteligência Artificial', 'Bacharelado', 'Vespertino', 'São Cristóvão', 'Graduação');

-- Vínculos
INSERT INTO universidade.vinculo VALUES(1, 'E101', 3, NULL, 'Ativo', NULL);
INSERT INTO universidade.vinculo VALUES(2, 'E102', 2, NULL, 'Ativo', NULL);
INSERT INTO universidade.vinculo VALUES(3, 'E103', 1, NULL, 'Ativo', NULL);
INSERT INTO universidade.vinculo VALUES(4, 'E104', 4, NULL, 'Ativo', NULL);
INSERT INTO universidade.vinculo VALUES(5, 'E105', 1, NULL, 'Ativo', NULL);
INSERT INTO universidade.vinculo VALUES(6, 'E106', 1, NULL, 'Ativo', NULL);
INSERT INTO universidade.vinculo VALUES(7, 'E107', 1, NULL, 'Ativo', NULL);
INSERT INTO universidade.vinculo VALUES(8, 'E108', 5, NULL, 'Ativo', NULL);
INSERT INTO universidade.vinculo VALUES(9, 'E109', 1, NULL, 'Ativo', NULL);
INSERT INTO universidade.vinculo VALUES(10, 'E110', 5, NULL, 'Ativo', NULL);
INSERT INTO universidade.vinculo VALUES(11, 'E111', 4, NULL, 'Ativo', NULL);
INSERT INTO universidade.vinculo VALUES(12, 'E112', 2, NULL, 'Ativo', NULL);
INSERT INTO universidade.vinculo VALUES(13, 'E113', 2, NULL, 'Ativo', NULL);