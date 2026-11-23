package com.miniautocare.jobcard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobCardRepository extends JpaRepository<JobCard, Long> {
}