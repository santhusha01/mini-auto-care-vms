package com.miniautocare.billing;

import com.miniautocare.jobcard.BillableSnapshot;
import com.miniautocare.jobcard.BillableSnapshot.Line;
import com.miniautocare.jobcard.JobCardQueryService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

// TODO replace with Dev 2
@Service
public class StubJobCardQueryService implements JobCardQueryService {

    @Override
    public BillableSnapshot getBillableSnapshot(Long jobCardId) {
        List<Line> services = List.of(
                new Line("SERVICE", "Oil & Filter Change", 1, new BigDecimal("4200.00"), new BigDecimal("4200.00")),
                new Line("SERVICE", "Brake Inspection", 1, new BigDecimal("2000.00"), new BigDecimal("2000.00")));
        List<Line> parts = List.of(
                new Line("PART", "Engine Oil 5W-30", 4, new BigDecimal("1850.00"), new BigDecimal("7400.00")),
                new Line("PART", "Oil Filter", 1, new BigDecimal("950.00"), new BigDecimal("950.00")));
        return new BillableSnapshot(jobCardId, "Ruwan Jayasinghe", new BigDecimal("14550.00"), services, parts);
    }
}