import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashTester {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.encode("password123"));
        System.out.println(
                encoder.matches("password123", "$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG"));
    }
}
