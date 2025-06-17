package io.github.philobiblon.backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.Expiry;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.ZonedDateTime;
import java.time.ZoneId;

@Configuration
public class CacheConfig {

    private final static int EXPIRATION_HOUR = 1;

    @Bean
    public CacheManager cacheManager() {
        Caffeine<Object, Object> caffeine = Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfter(new CustomExpiry());

        CaffeineCacheManager cacheManager = new CaffeineCacheManager("sparqlCache");
        cacheManager.setCaffeine(caffeine);
        return cacheManager;
    }

    public static class CustomExpiry implements Expiry<Object, Object> {

        @Override
        public long expireAfterCreate(Object key, Object value, long currentTime) {
            long expirationTime = computeExpirationMillis();
            long duration = expirationTime - System.currentTimeMillis();
            return duration > 0 ? duration * 1_000_000 : 0;
        }

        @Override
        public long expireAfterUpdate(Object key, Object value, long currentTime, long currentDuration) {
            return expireAfterCreate(key, value, currentTime);
        }

        @Override
        public long expireAfterRead(Object key, Object value, long currentTime, long currentDuration) {
            return currentDuration;
        }

        private long computeExpirationMillis() {
            ZonedDateTime now = ZonedDateTime.now(ZoneId.systemDefault());
            ZonedDateTime nextExpiration = now.withHour(EXPIRATION_HOUR).withMinute(0).withSecond(0).withNano(0);
            if (!now.isBefore(nextExpiration)) {
                nextExpiration = nextExpiration.plusDays(1);
            }
            return nextExpiration.toInstant().toEpochMilli();
        }
    }
}

