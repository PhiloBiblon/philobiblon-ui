package io.github.philobiblon.backend.representation;

import java.util.Map;

public class CacheInfo {
    public String totalProcessMemory;
    public boolean isCompressResults;
    public double totalEntriesMemory;
    public long totalEntries;
    public Map<String, Double> entrySizes;
    public long hitCount;
    public long missCount;
    public long loadSuccessCount;
    public long loadFailureCount;
    public double hitRate;
}
