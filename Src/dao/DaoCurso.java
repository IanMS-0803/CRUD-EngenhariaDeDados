package Src.dao;

import Src.connection.ConnectionFactory;
import Src.models.Curso;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

public class DaoCurso {
    public Curso[] lerCursos() {
        Connection conexao = ConnectionFactory.getConnection();
        PreparedStatement comando = null;
        ResultSet resultado = null;
        ArrayList<Curso> cursos = new ArrayList<>();

        String sql = "SELECT idCurso, nome, grau, turno, campus, nivel FROM universidade.curso";

        try {
            comando = conexao.prepareStatement(sql);
            resultado = comando.executeQuery();

            while (resultado.next()) {
                int id = resultado.getInt("idCurso");
                String nome = resultado.getString("nome");
                String grau = resultado.getString("grau");
                String turno = resultado.getString("turno");
                String campus = resultado.getString("campus");
                String nivel = resultado.getString("nivel");

                cursos.add(new Curso(id, nome, grau, turno, campus, nivel));
            }
        } catch (SQLException e) {
            System.err.println("Erro ao buscar cursos: " + e.getMessage());
            throw new RuntimeException("Erro ao buscar cursos " + e.getMessage(), e);
        } finally {
            ConnectionFactory.closeConnection(conexao, comando, resultado);
        }

        return cursos.toArray(new Curso[0]);
    }

    public void inserirCurso(Curso curso) {
        Connection conexao = ConnectionFactory.getConnection();
        PreparedStatement comando = null;

        String sql = "INSERT INTO universidade.curso (nome, grau, turno, campus, nivel) VALUES (?, ?, ?, ?, ?)";

        try {
            comando = conexao.prepareStatement(sql);
            comando.setString(1, curso.getNome());
            comando.setString(2, curso.getGrau());
            comando.setString(3, curso.getTurno());
            comando.setString(4, curso.getCampus());
            comando.setString(5, curso.getNivel());
            comando.executeUpdate();
            System.out.println("Curso inserido com sucesso!");
        } catch (SQLException e) {
            System.err.println("Erro interno no DAO ao inserir curso: " + e.getMessage());
            throw new RuntimeException("Não foi possível cadastrar o curso. Motivo: " + e.getMessage(), e);
        } finally {
            ConnectionFactory.closeConnection(conexao, comando);
        }
    }

    public void atualizarCurso(Curso curso) {
        Connection conexao = ConnectionFactory.getConnection();
        PreparedStatement comando = null;

        String sql = "UPDATE universidade.curso SET nome = ?, grau = ?, turno = ?, campus = ?, nivel = ? WHERE idCurso = ?";

        try {
            comando = conexao.prepareStatement(sql);
            comando.setString(1, curso.getNome());
            comando.setString(2, curso.getGrau());
            comando.setString(3, curso.getTurno());
            comando.setString(4, curso.getCampus());
            comando.setString(5, curso.getNivel());
            comando.setInt(6, curso.getId());
            comando.executeUpdate();
            System.out.println("Curso atualizado com sucesso!");
        } catch (SQLException e) {
            System.err.println("Erro interno no DAO ao atualizar curso: " + e.getMessage());
            throw new RuntimeException("Não foi possível atualizar o curso. Motivo: " + e.getMessage(), e);
        } finally {
            ConnectionFactory.closeConnection(conexao, comando);
        }
    }

    public void deletarCurso(Curso curso) {
        if (curso == null) {
            throw new IllegalArgumentException("Curso inválido para exclusão.");
        }
        deletarCurso(curso.getId());
    }

    public void deletarCurso(int idCurso) {
        Connection conexao = ConnectionFactory.getConnection();
        PreparedStatement comando = null;

        String sql = "DELETE FROM universidade.curso WHERE idCurso = ?";

        try {
            comando = conexao.prepareStatement(sql);
            comando.setInt(1, idCurso);
            comando.executeUpdate();
            System.out.println("Curso deletado com sucesso");
        } catch (SQLException e) {
            System.err.println("Erro interno no DAO ao deletar curso: " + e.getMessage());
            throw new RuntimeException("Não foi possível deletar o curso. Motivo: " + e.getMessage(), e);
        } finally {
            ConnectionFactory.closeConnection(conexao, comando);
        }
    }
}
