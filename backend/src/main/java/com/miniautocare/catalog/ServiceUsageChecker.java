package com.miniautocare.catalog;

public interface ServiceUsageChecker {
    boolean isServiceUsedInJobCards(Long serviceId);
}