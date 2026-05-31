package Src.dao;

import Src.connection.ConnectionFactory;
import Src.models.Estudante;
import Src.models.Usuario;
import java.sql.Array;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;

public class DaoEstudante {
    // método para retornar os Estudantes
    public Estudante[] lerEstudantes() {
        Connection conexao = ConnectionFactory.getConnection();
        PreparedStatement comando = null;
        ResultSet resultado = null;
        ArrayList<Estudante> estudantes = new ArrayList<>();

        String sql = "SELECT e.mat_estudante, e.cpf, e.MC, e.ano_ingresso, u.nome, u.data_nascimento, u.email, u.telefone, u.login, u.senha " +
                     "FROM universidade.estudante e " +
                     "LEFT JOIN universidade.usuario u ON e.cpf = u.cpf";

        try {
            comando = conexao.prepareStatement(sql);
            resultado = comando.executeQuery();
            while (resultado.next()) {
                String matricula = resultado.getString("mat_estudante");
                String cpf = resultado.getString("cpf");
                Double mc = null;
                double mcValue = resultado.getDouble("MC");
                if (!resultado.wasNull()) {
                    mc = mcValue;
                }
                int anoIngresso = resultado.getInt("ano_ingresso");

                String nome = resultado.getString("nome");
                Date dataNascimento = resultado.getDate("data_nascimento");
                String[] email = toStringArray(resultado.getArray("email"));
                String[] telefone = toStringArray(resultado.getArray("telefone"));
                String login = resultado.getString("login");
                String senha = resultado.getString("senha");

                Usuario usuario = new Usuario(cpf, nome, dataNascimento, email, telefone, login, senha);
                estudantes.add(new Estudante(matricula, usuario, mc, anoIngresso));
            }
        } catch (SQLException e) {
            System.err.println("Erro ao buscar estudantes: " + e.getMessage());
            throw new RuntimeException("Erro ao buscar estudantes " + e.getMessage(), e);
        } finally {
            ConnectionFactory.closeConnection(conexao, comando, resultado);
        }

        return estudantes.toArray(new Estudante[0]);
    }

    // método para deletar um Estudante pelo objeto
    public void deletarEstudane(Estudante key) {
        if (key == null || key.getMatricula() == null) {
            throw new IllegalArgumentException("Estudante ou matrícula inválida para exclusão.");
        }
        deletarEstudante(key.getMatricula());
    }

    // método para deletar um Estudante pela matrícula
    public void deletarEstudante(String matricula) {
        Connection conexao = ConnectionFactory.getConnection();
        PreparedStatement comando = null;

        String sql = "DELETE FROM universidade.estudante WHERE mat_estudante = ?";

        try {
            comando = conexao.prepareStatement(sql);
            comando.setString(1, matricula);
            comando.executeUpdate();
            System.out.println("Estudante deletado com sucesso");
        } catch (SQLException e) {
            System.err.println("Erro interno no DAO ao deletar estudante: " + e.getMessage());
            throw new RuntimeException("Não foi possível deletar o estudante. Motivo: " + e.getMessage(), e);
        } finally {
            ConnectionFactory.closeConnection(conexao, comando);
        }
    }

    // método para inserir um Estudante
    public void inserirEstudante(Estudante estudante) {
        Connection conexao = ConnectionFactory.getConnection();
        PreparedStatement comando = null;

        String sql = "INSERT INTO universidade.estudante (mat_estudante, cpf, MC, ano_ingresso) VALUES (?, ?, ?, ?)";

        try {
            comando = conexao.prepareStatement(sql);
            comando.setString(1, estudante.getMatricula());

            if (estudante.getUsuario() != null && estudante.getUsuario().getCpf() != null) {
                comando.setString(2, estudante.getUsuario().getCpf());
            } else {
                comando.setNull(2, Types.NUMERIC);
            }

            if (estudante.getMC() != null) {
                comando.setDouble(3, estudante.getMC());
            } else {
                comando.setNull(3, Types.NUMERIC);
            }

            comando.setInt(4, estudante.getAno_ingresso());
            comando.executeUpdate();
            System.out.println("Estudante inserido com sucesso!");
        } catch (SQLException e) {
            System.err.println("Erro interno no DAO ao inserir estudante: " + e.getMessage());
            throw new RuntimeException("Não foi possível cadastrar o estudante. Motivo: " + e.getMessage(), e);
        } finally {
            ConnectionFactory.closeConnection(conexao, comando);
        }
    }

    // método para atualizar um Estudante
    public void atualizarEstudante(Estudante estudante) {
        Connection conexao = ConnectionFactory.getConnection();
        PreparedStatement comando = null;

        String sql = "UPDATE universidade.estudante SET cpf = ?, MC = ?, ano_ingresso = ? WHERE mat_estudante = ?";

        try {
            comando = conexao.prepareStatement(sql);

            if (estudante.getUsuario() != null && estudante.getUsuario().getCpf() != null) {
                comando.setString(1, estudante.getUsuario().getCpf());
            } else {
                comando.setNull(1, Types.NUMERIC);
            }

            if (estudante.getMC() != null) {
                comando.setDouble(2, estudante.getMC());
            } else {
                comando.setNull(2, Types.NUMERIC);
            }

            comando.setInt(3, estudante.getAno_ingresso());
            comando.setString(4, estudante.getMatricula());
            comando.executeUpdate();
            System.out.println("Estudante atualizado com sucesso!");
        } catch (SQLException e) {
            System.err.println("Erro interno no DAO ao atualizar estudante: " + e.getMessage());
            throw new RuntimeException("Não foi possível atualizar o estudante. Motivo: " + e.getMessage(), e);
        } finally {
            ConnectionFactory.closeConnection(conexao, comando);
        }
    }

    // Metodo de apoio para lidar com campos de arrays do banco de dados
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
}
