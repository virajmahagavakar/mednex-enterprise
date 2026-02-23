// package com.mednex.mednex_enterprise;

// import com.mednex.mednex_enterprise.multitenancy.master.Tenant;
// import
// com.mednex.mednex_enterprise.multitenancy.service.TenantProvisioningService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;

// @RestController
// @RequestMapping("/api/public")
// public class RegistrationController {

// private final TenantProvisioningService tenantProvisioningService;

// @Autowired
// public RegistrationController(TenantProvisioningService
// tenantProvisioningService) {
// this.tenantProvisioningService = tenantProvisioningService;
// }

// @PostMapping("/register-hospital")
// public ResponseEntity<Tenant> registerHospital(
// @RequestParam String hospitalName,
// @RequestParam String adminEmail,
// @RequestParam String plan) {

// Tenant newTenant = tenantProvisioningService.provisionNewTenant(hospitalName,
// adminEmail, plan);
// return ResponseEntity.ok(newTenant);
// }
// }
