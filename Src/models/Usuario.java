package Src.models;
import java.sql.Date;

public class Usuario {
    String cpf;
    String nome;
    Date data_nascimento;
    String email[];
    String telefone[];
    String login;
    String senha;

    public Usuario(String cpf, String nome, Date data_nascimento, String[] email, String[] telefone, String login,
            String senha) {
        this.cpf = cpf;
        this.nome = nome;
        this.data_nascimento = data_nascimento;
        this.email = email;
        this.telefone = telefone;
        this.login = login;
        this.senha = senha;
    }

    public String getCpf() {
        return cpf;
    }
    public String getNome() {
        return nome;
    }
    public Date getData_nascimento() {
        return data_nascimento;
    }
    public String[] getEmail() {
        return email;
    }
    public String[] getTelefone() {
        return telefone;
    }
    public String getLogin() {
        return login;
    }
    public String getSenha() {
        return senha;
    }

}


