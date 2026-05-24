package Src.models;

public class Estudante {
    String matricula;
    Usuario usuario;
    Double MC;
    int ano_ingresso;
    
    public Estudante(String matricula, Usuario usuario, Double mC, int ano_ingresso) {
        this.matricula = matricula;
        this.usuario = usuario;
        MC = mC;
        this.ano_ingresso = ano_ingresso;
    }
    
    public String getMatricula() {
        return matricula;
    }
    public Usuario getUsuario() {
        return usuario;
    }
    public Double getMC() {
        return MC;
    }
    public int getAno_ingresso() {
        return ano_ingresso;
    }

    

}
