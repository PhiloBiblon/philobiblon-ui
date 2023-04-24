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

    private Map<K, V> map = new ConcurrentHashMap<>();
    private Map<K, Long> expirationTimes = new ConcurrentHashMap<>();
    private Timer expirationTimer = new Timer();
    private long period;

    public TimedMap(long expirationTime, TimeUnit timeUnit) {
        this.period = TimeUnit.MILLISECONDS.convert(expirationTime, timeUnit);
        expirationTimer.schedule(new ExpirationTask(), 0, period);
    }

    @Override
    public V put(K key, V value) {
        expirationTimes.put(key, System.currentTimeMillis());
        return map.put(key, value);
    }

    @Override
    public V get(Object key) {
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
                map.remove(key);
                expirationTimes.remove(key);
            }
        }
    }

    private class ExpirationTask extends TimerTask {
        @Override
        public void run() {
            checkExpiration();
        }
    }
}