package br.com.cifras.shared.util;

import org.eclipse.microprofile.config.ConfigProvider;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;

public class CryptoUtils {

    private static final String ALGORITHM = "AES";
    private static SecretKeySpec secretKey;

    private static void prepareKey() {
        if (secretKey == null) {
            try {
                String myKey = ConfigProvider.getConfig().getValue("cifras.crypto.master-key", String.class);
                byte[] key = myKey.getBytes(StandardCharsets.UTF_8);
                MessageDigest sha = MessageDigest.getInstance("SHA-256");
                key = sha.digest(key);
                key = Arrays.copyOf(key, 32);
                secretKey = new SecretKeySpec(key, ALGORITHM);
            } catch (Exception e) {
                throw new RuntimeException("Error while preparing crypto key", e);
            }
        }
    }

    public static String encrypt(String strToEncrypt) {
        if (strToEncrypt == null) return null;
        try {
            prepareKey();
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            return Base64.getEncoder().encodeToString(cipher.doFinal(strToEncrypt.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("Error while encrypting", e);
        }
    }

    public static String decrypt(String strToDecrypt) {
        if (strToDecrypt == null) return null;
        try {
            prepareKey();
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            return new String(cipher.doFinal(Base64.getDecoder().decode(strToDecrypt)), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error while decrypting", e);
        }
    }
}
