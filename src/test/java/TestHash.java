import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = "$2a$10$tlqgpvfIpTt9a8HpZwD.r.ybF/IPc4HgPIV8EbxmAnusg60n/4QOW";

        String[] passwords = {
                "password", "password123", "admin", "admin123", "123456", "12345678", "priya", "nurse"
        };

        for (String p : passwords) {
            if (encoder.matches(p, hash)) {
                System.out.println("Match found: " + p);
                return;
            }
        }
        System.out.println("No match found.");
    }
}
