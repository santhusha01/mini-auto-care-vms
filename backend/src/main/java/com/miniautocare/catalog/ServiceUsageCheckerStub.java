package com.miniautocare.catalog;

import org.springframework.stereotype.Component;

@Component
public class ServiceUsageCheckerStub implements ServiceUsageChecker {

    @Override
    public boolean isServiceUsedInJobCards(Long serviceId) {
        // TODO replace with Dev 2 (JobCardService / repository check once V5__job_cards is merged)
        return false;
    }
}