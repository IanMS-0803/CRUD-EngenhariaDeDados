package Src;

import Src.connection.ConnectionFactory;
import Src.dao.DaoUsuario;
import Src.models.Usuario;
import java.sql.Date;
import java.util.Arrays;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("=== CRUD Engenharia de Dados - Teste via Terminal ===");
        System.out.println("Use este programa para listar e inserir usuários no banco.");

        System.out.print("Deseja configurar usuário e senha do banco? (s/n): ");
        String useCustomCreds = scanner.nextLine().trim();
        if (useCustomCreds.equalsIgnoreCase("s") || useCustomCreds.equalsIgnoreCase("sim")) {
            System.out.print("Usuário do banco: ");
            String user = scanner.nextLine().trim();
            System.out.print("Senha do banco: ");
            String pass = scanner.nextLine().trim();
            ConnectionFactory.setCredencias(user, pass);
        }

        DaoUsuario dao = new DaoUsuario();

        while (true) {
            System.out.println();
            System.out.println("1) Listar usuários");
            System.out.println("2) Inserir usuário");
            System.out.println("0) Sair");
            System.out.print("Escolha uma opção: ");
            String option = scanner.nextLine().trim();

            switch (option) {
                case "1" -> listarUsuarios(dao);
                case "2" -> inserirUsuario(dao, scanner);
                case "0" -> {
                    System.out.println("Encerrando...");
                    scanner.close();
                    return;
                }
                default -> System.out.println("Opção inválida. Tente novamente.");
            }
        }
    }

    private static void listarUsuarios(DaoUsuario dao) {
        System.out.println("\nCarregando usuários...");
        try {
            Usuario[] usuarios = dao.lerUsuarios();
            if (usuarios.length == 0) {
                System.out.println("Nenhum usuário encontrado.");
                return;
            }

            for (Usuario usuario : usuarios) {
                System.out.println("------------------------------");
                System.out.println("CPF: " + usuario.getCpf());
                System.out.println("Nome: " + usuario.getNome());
                System.out.println("Data de nascimento: " + usuario.getData_nascimento());
                System.out.println("Emails: " + toDisplayArray(usuario.getEmail()));
                System.out.println("Telefones: " + toDisplayArray(usuario.getTelefone()));
                System.out.println("Login: " + usuario.getLogin());
                System.out.println("Senha: " + usuario.getSenha());
            }
            System.out.println("------------------------------");
        } catch (RuntimeException e) {
            System.err.println("Falha ao listar usuários: " + e.getMessage());
        }
    }

    private static void inserirUsuario(DaoUsuario dao, Scanner scanner) {
        try {
            System.out.println("\nInforme os dados do novo usuário:");
            System.out.print("CPF: ");
            String cpf = scanner.nextLine().trim();
            System.out.print("Nome: ");
            String nome = scanner.nextLine().trim();

            System.out.print("Data de nascimento (yyyy-MM-dd) ou vazio: ");
            String dataTexto = scanner.nextLine().trim();
            Date dataNascimento = null;
            if (!dataTexto.isEmpty()) {
                dataNascimento = Date.valueOf(dataTexto);
            }

            System.out.print("Emails separados por vírgula ou vazio: ");
            String[] emails = parseArray(scanner.nextLine());

            System.out.print("Telefones separados por vírgula ou vazio: ");
            String[] telefones = parseArray(scanner.nextLine());

            System.out.print("Login: ");
            String login = scanner.nextLine().trim();
            System.out.print("Senha: ");
            String senha = scanner.nextLine().trim();

            Usuario usuario = new Usuario(cpf, nome, dataNascimento, emails, telefones, login, senha);
            dao.inserirUsuario(usuario);
        } catch (IllegalArgumentException e) {
            System.err.println("Formato de data inválido. Use yyyy-MM-dd.");
        } catch (RuntimeException e) {
            System.err.println("Erro ao inserir usuário: " + e.getMessage());
        }
    }

    private static String[] parseArray(String input) {
        if (input == null || input.trim().isEmpty()) {
            return null;
        }
        return Arrays.stream(input.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
    }

    private static String toDisplayArray(String[] array) {
        if (array == null || array.length == 0) {
            return "[]";
        }
        return Arrays.toString(array);
    }
}
