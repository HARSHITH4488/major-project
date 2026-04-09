import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ContractorService } from '../contractor.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contractor-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contractor-detail.component.html',
  styleUrls: ['./contractor-detail.component.scss']
})
export class ContractorDetailComponent implements OnInit {

  contractor: any;
  summary: any;

  projects: any[] = [];

  allPayments: any[] = [];
  payments: any[] = [];
  selectedProjectId: string = '';

  contractorId!: number;

  activeTab: 'projects' | 'payments' | 'documents' = 'projects';

  paymentForm!: FormGroup;
  showPaymentForm = false;

  constructor(
    private route: ActivatedRoute,
    private contractorService: ContractorService,
    private fb: FormBuilder
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.contractorId = Number(this.route.snapshot.paramMap.get('id'));

    this.initForm();
    this.loadSummary();
    this.loadProjectFinancials();
    this.loadPayments();
  }

  // ================= TAB SWITCH =================
  setTab(tab: 'projects' | 'payments' | 'documents') {
    this.activeTab = tab;

    if (tab === 'payments') {
      this.loadPayments();
    }
  }

  // ================= INIT FORM =================
  initForm() {
    this.paymentForm = this.fb.group({
      projectId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      paymentType: ['', Validators.required],
      paymentDate: ['', Validators.required]
    });
  }

  // ================= LOAD SUMMARY =================
loadSummary() {

  this.contractorService
    .getById(this.contractorId)
    .subscribe({
      next: (res:any) => {

        console.log("CONTRACTOR:", res);

        const data = res?.data || res;

        this.contractor = data;

      },
      error: (err) => {
        console.error("Contractor load error:", err);
      }
    });

}

  // ================= LOAD PROJECT FINANCIALS =================
 loadProjectFinancials() {

  this.contractorService
    .getProjectFinancials(this.contractorId)
    .subscribe({
      next: (res:any) => {

        const data = res?.data?.data || res?.data || [];
        this.projects = data;

        // 🔥 Calculate summary from projects
        let totalContract = 0;
        let totalPaid = 0;

        this.projects.forEach((p:any) => {
          totalContract += Number(p.contractAmount || 0);
          totalPaid += Number(p.totalPaid || 0);
        });

        this.summary = {
          totalContractValue: totalContract,
          totalPaid: totalPaid,
          remaining: totalContract - totalPaid
        };

      }
    });

}
  // ================= LOAD PAYMENTS =================
  loadPayments() {
    this.contractorService
      .getPaymentsByContractor(this.contractorId)
      .subscribe({
        next: (res: any) => {
          const payments = res?.data || [];

          this.allPayments = payments;
          this.payments = [...payments];
        },
        error: (err) => {
          console.error('Payment load error:', err);
          this.allPayments = [];
          this.payments = [];
        }
      });
  }

  // ================= FILTER PAYMENTS =================
  filterPayments() {
    if (!this.selectedProjectId) {
      this.payments = [...this.allPayments];
    } else {
      this.payments = this.allPayments.filter(p =>
        p.project?.id == this.selectedProjectId
      );
    }
  }

  // ================= TOGGLE FORM =================
  togglePaymentForm() {
    this.showPaymentForm = !this.showPaymentForm;
  }

  submitPayment() {
  if (this.paymentForm.invalid) return;

  const formValue = this.paymentForm.value;

  const payload = {
    contractorId: this.contractorId, // 🔥 REQUIRED
    projectId: Number(formValue.projectId),
    amount: Number(formValue.amount),
    paymentType: formValue.paymentType,
    paymentDate: formValue.paymentDate
  };

  this.contractorService
    .createContractorPayment(payload) // 🔥 send full object
    .subscribe({
      next: () => {
        this.showPaymentForm = false;
        this.paymentForm.reset();

        this.loadPayments();
        this.loadSummary();
        this.loadProjectFinancials();

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Payment added successfully',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true
        });
      },
      error: (err) => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: err.error?.message || 'Payment failed',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
}

  // ================= DELETE PAYMENT =================
  deletePayment(paymentId: number) {

    Swal.fire({
      title: 'Delete this payment?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {

      if (result.isConfirmed) {
        this.contractorService
          .deleteContractorPayment(paymentId)
          .subscribe({
            next: () => {
              this.loadPayments();
              this.loadSummary();
              this.loadProjectFinancials();

              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Payment deleted successfully',
                showConfirmButton: false,
                timer: 2500
              });
            },
            error: () => {
              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Delete failed',
                showConfirmButton: false,
                timer: 3000
              });
            }
          });
      }
    });
  }
}