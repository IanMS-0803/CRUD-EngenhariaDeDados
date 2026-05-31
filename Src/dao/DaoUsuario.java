package Src.dao;

import Src.connection.ConnectionFactory;
import Src.models.Usuario;
import java.sql.Array;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

public class DaoUsuario {
    // metodo para buscar os usuarios
    public Usuario[] lerUsuarios(){
        Connection conexao = ConnectionFactory.getConnection();
        PreparedStatement comando = null;
        ResultSet resultado = null;
        ArrayList<Usuario> users = new ArrayList<>();

        String sql = "SELECT * FROM universidade.usuario";

        try {
            comando = conexao.prepareStatement(sql);
            resultado = comando.executeQuery();
            while(resultado.next()){
                String cpf = resultado.getString("cpf");
                String nome = resultado.getString("nome");
                Date data = resultado.getDate("data_nascimento");

                String[] email = toStringArray(resultado.getArray("email"));
                String[] telefone = toStringArray(resultado.getArray("telefone"));

                String login = resultado.getString("login");
                String senha = resultado.getString("senha");

                users.add(new Usuario(cpf, nome, data, email, telefone, login, senha));
            }
        } catch (SQLException e) {
            System.err.println("Erro ao buscar usuario: " + e.getMessage());
            throw new RuntimeException("Erro ao buscar usuarios " + e.getMessage(), e);
        } finally {
            ConnectionFactory.closeConnection(conexao, comando, resultado);
        }

        return users.toArray(new Usuario[0]);
    }

    //Metodo de apoio para lidar com campos de arrays do banco de dados (email, telefone, etc...)
    private String[] toStringArray(Array sqlArray) throws SQLException {
        if (sqlArray == null) {
            return null;
        }

        Object array = sqlArray.getArray();
        if (array instanceof String[]) {
            return (String[]) array;
        }
        if (array instanceof Object[]) {
            Object[] objectArray = (Object[]) array;
            String[] stringArray = new String[objectArray.length];
            for (int i = 0; i < objectArray.length; i++) {
                stringArray[i] = objectArray[i] != null ? objectArray[i].toString() : null;
            }
            return stringArray;
        }
        return null;
    }
    // metodo para atualizar o usuario
    public void atualizarUsuario(Usuario user){
        Connection conexao = ConnectionFactory.getConnection();
        PreparedStatement comando = null;

        String sql = "UPDATE universidade.usuario SET nome = ?, data_nascimento = ?, email = ?, telefone = ?, login = ?, senha = ? WHERE cpf = ?::numeric";
        
        try {
            comando = conexao.prepareStatement(sql);
            comando.setString(1, user.getNome());

            if (user.getData_nascimento() != null) {
                comando.setDate(2, user.getData_nascimento());
            } else {
                comando.setNull(2, java.sql.Types.DATE);
            }

            if (user.getEmail() != null) {
                java.sql.Array arrayEmail = conexao.createArrayOf("varchar", user.getEmail());
                comando.setArray(3, arrayEmail);
            } else {
                comando.setNull(3, java.sql.Types.ARRAY);
            }

            if (user.getTelefone() != null) {
                java.sql.Array arrayTelefone = conexao.createArrayOf("varchar", user.getTelefone());
                comando.setArray(4, arrayTelefone);
            } else {
                comando.setNull(4, java.sql.Types.ARRAY);
            }

            comando.setString(5, user.getLogin());
            comando.setString(6, user.getSenha());
            comando.setString(7, user.getCpf());

            comando.executeUpdate();
            System.out.println("Usuário atualizado com sucesso!");
        } catch (SQLException e) {
            System.err.println("Erro interno no DAO ao atualizar usuário: " + e.getMessage());
            throw new RuntimeException("Não foi possível atualizar o usuário. Motivo: " + e.getMessage(), e);
        } finally {
            ConnectionFactory.closeConnection(conexao, comando);
        }
    }

    // metodo para deletar um usuario
    public void deletarUsuario(String key){ /*primary key - CPF */
        Connection conexao = ConnectionFactory.getConnection();
        PreparedStatement comando = null;

        String sql = "DELETE FROM universidade.usuario WHERE cpf = " + key;

        try {
            comando = conexao.prepareStatement(sql);
            comando.executeUpdate();
            System.out.println("Usuario deletado com sucesso");
        } catch (SQLException e) {
            System.err.println("Erro interno no DAO ao deletar usuário: " + e.getMessage());
            throw new RuntimeException("Não foi possível deletar o usuário. Motivo: " + e.getMessage(), e);
        } finally {
            ConnectionFactory.closeConnection(conexao, comando);
        }
    }


    // metodo para inserir um usuario
    public void inserirUsuario(Usuario user) {
        Connection conexao = ConnectionFactory.getConnection();
        PreparedStatement comando = null;

        String sql = "INSERT into universidade.usuario (cpf, nome, data_nascimento, email, telefone, login, senha) VALUES (?, ?, ?, ?, ?, ?, ?)";

        try {
            comando = conexao.prepareStatement(sql);

            comando.setString(1, user.getCpf()); 
            comando.setString(2, user.getNome());
            
            if (user.getData_nascimento() != null) {
                comando.setDate(3, user.getData_nascimento());
            } else {
                comando.setNull(3, java.sql.Types.DATE);
            }

            if (user.getEmail() != null) {
                java.sql.Array arrayEmail = conexao.createArrayOf("varchar", user.getEmail());
                comando.setArray(4, arrayEmail);
            } else {
                comando.setNull(4, java.sql.Types.ARRAY);
            }

            if (user.getTelefone() != null) {
                java.sql.Array arrayTelefone = conexao.createArrayOf("varchar", user.getTelefone());
                comando.setArray(5, arrayTelefone);
            } else {
                comando.setNull(5, java.sql.Types.ARRAY);
            }

            comando.setString(6, user.getLogin());
            comando.setString(7, user.getSenha());

            comando.executeUpdate();
            System.out.println("Usuário inserido com sucesso!");

        } catch (SQLException e) {
            System.err.println("Erro interno no DAO ao inserir usuário: " + e.getMessage());
            throw new RuntimeException("Não foi possível cadastrar o usuário. Motivo: " + e.getMessage(), e);
        } finally {
            // Garante o fechamento dos recursos mesmo se houver erro
            ConnectionFactory.closeConnection(conexao, comando);
        }
    }
}