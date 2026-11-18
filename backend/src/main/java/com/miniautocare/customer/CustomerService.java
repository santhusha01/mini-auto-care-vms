package com.miniautocare.customer;

import com.miniautocare.common.ConflictException;
import com.miniautocare.common.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Customer not found with id: " + id));
    }

    public List<Customer> searchCustomers(String query) {
        return customerRepository.findByNameContainingIgnoreCaseOrPhoneContaining(query, query);
    }

    public Customer createCustomer(CustomerRequest request) {
        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException("Phone number already exists: " + request.getPhone());
        }
        
        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Long id, CustomerRequest request) {
        Customer existingCustomer = getCustomerById(id);
        
        // Check for duplicate phone only if they are changing it
        if (!existingCustomer.getPhone().equals(request.getPhone()) && 
            customerRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException("Phone number already exists: " + request.getPhone());
        }

        existingCustomer.setName(request.getName());
        existingCustomer.setPhone(request.getPhone());
        existingCustomer.setEmail(request.getEmail());
        existingCustomer.setAddress(request.getAddress());
        
        return customerRepository.save(existingCustomer);
    }

    public void deleteCustomer(Long id) {
        Customer existingCustomer = getCustomerById(id);
        customerRepository.delete(existingCustomer);
    }
}