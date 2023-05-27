package io.github.philobiblon.backend.helper;

import java.util.AbstractMap;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

public class TimedMap<K, V> extends AbstractMap<K, V> {

    private final Map<K, V> map = new ConcurrentHashMap<>();
    private final Map<K, Long> expirationTimes = new ConcurrentHashMap<>();
    private final long period;
    private final boolean renewOnGet;

    public TimedMap(long expirationTime, TimeUnit timeUnit) {
        this(expirationTime, timeUnit, false);
    }

    public TimedMap(long expirationTime, TimeUnit timeUnit, boolean renewOnGet) {
        this.period = TimeUnit.MILLISECONDS.convert(expirationTime, timeUnit);
        this.renewOnGet = renewOnGet;
        new Timer().schedule(new ExpirationTask(), 0, period);
    }

    @Override
    public V put(K key, V value) {
        resetExpirationTime(key);
        return map.put(key, value);
    }

    @Override
    public V get(Object key) {
        if(renewOnGet) {
            resetExpirationTime((K) key);
        }
        return map.get(key);
    }

    @Override
    public boolean containsKey(Object key) {
        return map.containsKey(key);
    }

    @Override
    public V remove(Object key) {
        expirationTimes.remove(key);
        return map.remove(key);
    }

    @Override
    public Set<Entry<K, V>> entrySet() {
        return map.entrySet();
    }

    @Override
    public int size() {
        return map.size();
    }

    @Override
    public boolean isEmpty() {
        return map.isEmpty();
    }

    @Override
    public Collection<V> values() {
        return map.values();
    }

    private void checkExpiration() {
        long now = System.currentTimeMillis();
        for (K key : map.keySet()) {
            if (now - expirationTimes.get(key) > period) {
                remove(key);
            }
        }
    }

    private class ExpirationTask extends TimerTask {
        @Override
        public void run() {
            checkExpiration();
        }
    }

    private void resetExpirationTime(K key) {
        expirationTimes.put(key, System.currentTimeMillis());
    }
}