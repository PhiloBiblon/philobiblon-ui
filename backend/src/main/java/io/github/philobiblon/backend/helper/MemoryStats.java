package io.github.philobiblon.backend.helper;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;

public class MemoryStats {
    public static String getMemoryUsage() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
        MemoryUsage nonHeapUsage = memoryBean.getNonHeapMemoryUsage();

        long usedHeap = heapUsage.getUsed();
        long usedNonHeap = nonHeapUsage.getUsed();

        return String.format(
            "Total Used Memory: %.2f MB (Used Heap Memory: %.2f MB, Used Non-Heap Memory: %.2f MB)",
            usedHeap / 1024.0 / 1024.0,
            usedNonHeap / 1024.0 / 1024.0,
            (usedHeap + usedNonHeap) / 1024.0 / 1024.0
        );
    }
}
