package Src.dao;

import Src.connection.ConnectionFactory;
import Src.models.Curso;
import Src.models.Estudante;
import Src.models.Usuario;
import Src.models.Vinculo;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;

public class DaoVinculo {
    public Vinculo[] lerVinculos() {
        Connection conexao = ConnectionFactory.getConnection();
        PreparedStatement comando = null;
        ResultSet resultado = null;
        ArrayList<Vinculo> vinculos = new ArrayList<>();

        String sql = "SELECT v.idVinculo, v.mat_estudante, v.curso, v.data_entrada, v.status, v.data_saida, " +
                     "e.cpf AS estudante_cpf, e.MC AS estudante_MC, e.ano_ingresso, " +
                     "u.nome, u.data_nascimento, u.email, u.telefone, u.login, u.senha, " +
                     "c.idCurso, c.nome AS curso_nome, c.grau, c.turno, c.campus, c.nivel " +
                     "FROM universidade.vinculo v " +
                     "LEFT JOIN universidade.estudante e ON v.mat_estudante = e.mat_estudante " +
                     "LEFT JOIN universidade.usuario u ON e.cpf = u.cpf " +
                     "LEFT JOIN universidade.curso c ON v.curso = c.idCurso";

        try {
            comando = conexao.prepareStatement(sql);
            resultado = comando.executeQuery();

            while (resultado.next()) {
                int id = resultado.getInt("idVinculo");
                String matricula = resultado.getString("mat_estudante");
                int cursoId = resultado.getInt("curso");
                Date dataEntrada = resultado.getDate("data_entrada");
                String status = resultado.getString("status");
                Date dataSaida = resultado.getDate("data_saida");

                String cpf = resultado.getString("estudante_cpf");
                Double mc = null;
                double mcValue = resultado.getDouble("estudante_MC");
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

                String cursoNome = resultado.getString("curso_nome");
                String grau = resultado.getString("grau");
                String turno = resultado.getString("turno");
                String campus = resultado.getString("campus");
                String nivel = resultado.getString("nivel");

                Usuario usuario = null;
                if (cpf != null) {
                    usuario = new Usuario(cpf, nome, dataNascimento, email, telefone, login, senha);
                }
                Estudante estudante = new Estudante(matricula, usuario, mc, anoIngresso);
                Curso curso = new Curso(cursoId, cursoNome, grau, turno, campus, nivel);

                vinculos.add(new Vinculo(id, estudante, curso, dataEntrada, status, dataSaida));
            }
        } catch (SQLException e) {
            System.err.println("Erro ao buscar vínculos: " + e.getMessage());
            throw new RuntimeException("Erro ao buscar vínculos " + e.getMessage(), e);
        } finally {
            ConnectionFactory.closeConnection(conexao, comando, resultado);
        }

        return vinculos.toArray(new Vinculo[0]);
    }

    public void inserirVinculo(Vinculo vinculo) {
        Connection conexao = ConnectionFactory.getConnection();
        PreparedStatement comando = null;

        String sql = "INSERT INTO universidade.vinculo (mat_estudante, curso, data_entrada, status, data_saida) VALUES (?, ?, ?, ?, ?)";

        try {
            comando = conexao.prepareStatement(sql);
            comando.setString(1, vinculo.getEstudante().getMatricula());
            comando.setInt(2, vinculo.getCurso().getId());

            if (vinculo.getData_entrada() != null) {
                comando.setDate(3, vinculo.getData_entrada());
            } else {
                comando.setNull(3, Types.DATE);
            }

            comando.setString(4, vinculo.getStatus());

            if (vinculo.getData_saida() != null) {
                comando.setDate(5, vinculo.getData_saida());
            } else {
                comando.setNull(5, Types.DATE);
            }

            comando.executeUpdate();
            System.out.println("Vínculo inserido com sucesso!");
        } catch (SQLException e) {
            System.err.println("Erro interno no DAO ao inserir vínculo: " + e.getMessage());
            throw new RuntimeException("Não foi possível cadastrar o vínculo. Motivo: " + e.getMessage(), e);
        } finally {
            ConnectionFactory.closeConnection(conexao, comando);
        }
    }

    public void atualizarVinculo(Vinculo vinculo) {
        Connection conexao = ConnectionFactory.getConnection();
        PreparedStatement comando = null;

        String sql = "UPDATE universidade.vinculo SET mat_estudante = ?, curso = ?, data_entrada = ?, status = ?, data_saida = ? WHERE idVinculo = ?";

        try {
            comando = conexao.prepareStatement(sql);
            comando.setString(1, vinculo.getEstudante().getMatricula());
            comando.setInt(2, vinculo.getCurso().getId());

            if (vinculo.getData_entrada() != null) {
                comando.setDate(3, vinculo.getData_entrada());
            } else {
                comando.setNull(3, Types.DATE);
            }

            comando.setString(4, vinculo.getStatus());

            if (vinculo.getData_saida() != null) {
                comando.setDate(5, vinculo.getData_saida());
            } else {
                comando.setNull(5, Types.DATE);
            }

            comando.setInt(6, vinculo.getId());
            comando.executeUpdate();
            System.out.println("Vínculo atualizado com sucesso!");
        } catch (SQLException e) {
            System.err.println("Erro interno no DAO ao atualizar vínculo: " + e.getMessage());
            throw new RuntimeException("Não foi possível atualizar o vínculo. Motivo: " + e.getMessage(), e);
        } finally {
            ConnectionFactory.closeConnection(conexao, comando);
        }
    }

    public void deletarVinculo(Vinculo vinculo) {
        if (vinculo == null) {
            throw new IllegalArgumentException("Vínculo inválido para exclusão.");
        }
        deletarVinculo(vinculo.getId());
    }

    public void deletarVinculo(int idVinculo) {
        Connection conexao = ConnectionFactory.getConnection();
        PreparedStatement comando = null;

        String sql = "DELETE FROM universidade.vinculo WHERE idVinculo = ?";

        try {
            comando = conexao.prepareStatement(sql);
            comando.setInt(1, idVinculo);
            comando.executeUpdate();
            System.out.println("Vínculo deletado com sucesso");
        } catch (SQLException e) {
            System.err.println("Erro interno no DAO ao deletar vínculo: " + e.getMessage());
            throw new RuntimeException("Não foi possível deletar o vínculo. Motivo: " + e.getMessage(), e);
        } finally {
            ConnectionFactory.closeConnection(conexao, comando);
        }
    }

    private String[] toStringArray(java.sql.Array sqlArray) throws SQLException {
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
