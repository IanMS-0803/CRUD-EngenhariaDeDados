package Src.connection;
import java.sql.*;

public class ConnectionFactory {

    // Constantes de Configuração
    private static final String DRIVER = "org.postgresql.Driver";
    private static final String DB = "BancoUFS";
    private static final String HOST = "postgres-ufs-ed.crhmjqwbzcke.us-east-1.rds.amazonaws.com:5432";
    private static final String URL = "jdbc:postgresql://" + HOST + "/" + DB;
    private static String USER = "postgres";
    private static String PASS = "";

    public static void setCredencias(String user, String pass){
        USER = user;
        PASS = pass;
    }

    /**
     * Método responsável por abrir e retornar uma conexão ativa com o banco.
     */
    public static Connection getConnection() {
        if(PASS == null || USER == null){
            throw new RuntimeException("Credenciais do banco de dados não foram configuradas!");
        }

        try {
            // Regista o Driver do PostgreSQL na memória da JVM
            Class.forName(DRIVER);
            
            // Solicita a conexão ao Driver Manager
            return DriverManager.getConnection(URL, USER, PASS);
            
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("Driver do banco de dados não foi encontrado. Adicione o JAR do Postgres ao projeto.", e);
        } catch (SQLException e) {
            throw new RuntimeException("Usuário ou senha incorretos para o banco de dados!", e);
        }
    }

    /**
     * Sobrecarga de métodos para fechar os recursos com segurança, evitando vazamento de memória.
     */
    public static void closeConnection(Connection con) {
        if (con != null) {
            try {
                con.close();
            } catch (SQLException e) {
                System.err.println("Erro ao fechar a conexão: " + e.getMessage());
            }
        }
    }

    public static void closeConnection(Connection con, PreparedStatement stmt) {
        closeConnection(con); // Fecha a conexão primeiro
        if (stmt != null) {
            try {
                stmt.close();
            } catch (SQLException e) {
                System.err.println("Erro ao fechar o PreparedStatement: " + e.getMessage());
            }
        }
    }

    public static void closeConnection(Connection con, PreparedStatement stmt, ResultSet rs) {
        closeConnection(con, stmt); // Fecha a conexão e o statement
        if (rs != null) {
            try {
                rs.close();
            } catch (SQLException e) {
                System.err.println("Erro ao fechar o ResultSet: " + e.getMessage());
            }
        }
    }
}