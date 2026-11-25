package com.miniautocare.jobcard;

public interface JobCardQueryService {
    /**
     * Returns the billable data of a COMPLETED job card.
     * Throws NotFoundException if the id does not exist,
     * BadRequestException if the job card is not COMPLETED.
     */
    BillableSnapshot getBillableSnapshot(Long jobCardId);
}
