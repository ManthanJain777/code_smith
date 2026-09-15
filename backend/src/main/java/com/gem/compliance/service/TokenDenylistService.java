package com.gem.compliance.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * TokenDenylistService
 *
 * Implements server-side stateless JWT revocation on user logout (Fix Issue 13).
 * When a user logs out, their JWT is registered in the denylist and immediately blocked
 * from subsequent authenticated requests.
 */
@Service
@Slf4j
public class TokenDenylistService {

    private final Set<String> denylistedTokens = ConcurrentHashMap.newKeySet();

    public void denylistToken(String token) {
        if (token != null && !token.isBlank()) {
            denylistedTokens.add(token.trim());
            log.info("JWT token successfully added to server-side revocation denylist.");
        }
    }

    public boolean isDenylisted(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        return denylistedTokens.contains(token.trim());
    }

    public int getDenylistedCount() {
        return denylistedTokens.size();
    }

    public void clear() {
        denylistedTokens.clear();
    }
}
