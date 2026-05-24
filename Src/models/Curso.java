package Src.models;

public class Curso {
    int id;
    String nome;
    String grau;
    String turno;
    String campus;
    String nivel;

    public Curso(int id, String nome, String grau, String turno, String campus, String nivel) {
        this.id = id;
        this.nome = nome;
        this.grau = grau;
        this.turno = turno;
        this.campus = campus;
        this.nivel = nivel;
    }
    
    public int getId() {
        return id;
    }
    public String getNome() {
        return nome;
    }
    public String getGrau() {
        return grau;
    }
    public String getTurno() {
        return turno;
    }
    public String getCampus() {
        return campus;
    }
    public String getNivel() {
        return nivel;
    }

    
}
