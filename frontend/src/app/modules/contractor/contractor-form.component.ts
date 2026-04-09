import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ContractorService } from './contractor.service';

@Component({
  selector: 'app-contractor-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './contractor-form.component.html',
  styleUrls: ['./contractor-form.component.scss']
})
export class ContractorFormComponent implements OnInit {

  contractor: any = this.getEmptyContractor();

  contractorId: number | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;

  workTypes: string[] = [
    'Electrician',
    'Plumber',
    'Carpenter',
    'Painter',
    'Civil Contractor'
  ];
  approvedContractors: any[] = [];
selectedUserId: number | null = null;

  constructor(
    private contractorService: ContractorService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

  this.loadApprovedContractors();

  const id = this.route.snapshot.paramMap.get('id');

  if (id) {
    this.contractorId = +id;
    this.isEditMode = true;
    this.loadContractor(this.contractorId);
  }
}

  getEmptyContractor() {
  return {
    name: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    natureOfWork: '',
    specialization: ''   // ✅ NEW FIELD
  };
}

  loadContractor(id: number) {
    this.isLoading = true;

    this.contractorService.getById(id).subscribe({
      next: (res: any) => {
        this.contractor = res?.data || res;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
  loadApprovedContractors() {

  this.contractorService.getApprovedContractors().subscribe({
    next: (res: any) => {
      this.approvedContractors = res?.data || res;
    },
    error: () => {
      this.approvedContractors = [];
    }
  });

}
onSelectContractor(userId: number | null) {

  if (!userId) return;

  const selected = this.approvedContractors.find(
    (u: any) => u.id == userId
  );

  if (!selected) return;

  // ✅ Store selected userId
  this.selectedUserId = selected.id;

  // ✅ Auto-fill contractor details
  this.contractor.name = selected.name;
  this.contractor.email = selected.email;
  this.contractor.phone = selected.phone;
}
  onSubmit() {

  if (!this.contractor.name) {
    alert('Name is required');
    return;
  }

  if (!this.contractor.natureOfWork) {
    alert('Nature of Work is required');
    return;
  }

  // 🔥 IMPORTANT VALIDATION
  if (!this.selectedUserId) {
    alert('Please select a registered contractor');
    return;
  }

  this.isLoading = true;

  // ✅ CREATE CORRECT PAYLOAD
  const payload = {
    ...this.contractor,
    user: {
      id: this.selectedUserId // 🔥 CRITICAL FIX
    }
  };

  if (this.isEditMode && this.contractorId) {

    this.contractorService.update(this.contractorId, payload)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/contractors']);
        },
        error: () => {
          this.isLoading = false;
        }
      });

  } else {

    this.contractorService.create(payload)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/contractors']);
        },
        error: () => {
          this.isLoading = false;
        }
      });

  }
}
}