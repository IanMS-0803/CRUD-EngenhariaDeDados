package Src.models;

import java.sql.Date;

public class Vinculo {
    int id;
    Estudante estudante;
    Curso curso;
    java.sql.Date data_entrada;
    String status;
    java.sql.Date data_saida;
    
    public Vinculo(int id, Estudante estudante, Curso curso, Date data_entrada, String status, Date data_saida) {
        this.id = id;
        this.estudante = estudante;
        this.curso = curso;
        this.data_entrada = data_entrada;
        this.status = status;
        this.data_saida = data_saida;
    }

    public int getId() {
        return id;
    }
    public Estudante getEstudante() {
        return estudante;
    }
    public Curso getCurso() {
        return curso;
    }
    public java.sql.Date getData_entrada() {
        return data_entrada;
    }
    public String getStatus() {
        return status;
    }
    public java.sql.Date getData_saida() {
        return data_saida;
    }
}
