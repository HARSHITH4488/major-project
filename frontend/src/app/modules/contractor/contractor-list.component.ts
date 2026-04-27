import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ContractorService } from './contractor.service';

@Component({
  selector: 'app-contractor-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './contractor-list.component.html',
  styleUrls: ['./contractor-list.component.scss']
})
export class ContractorListComponent implements OnInit{
  contractors: any[] = [];
  filteredContractors: any[] = [];   // ✅ REQUIRED PROPERTY

  loading = false;

  selectedWorkType: string = '';

  workTypes: string[] = [
    'Electrician',
    'Plumber',
    'Carpenter',
    'Painter',
    'Civil Contractor'
  ];

  constructor(
    private contractorService: ContractorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchContractors();
  }

  fetchContractors() {
    this.loading = true;

    this.contractorService.getAll().subscribe({
      next: (res: any) => {

        // Handle wrapper response
        this.contractors = res?.data?.data || [];
        this.filteredContractors = [...this.contractors];

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onFilterChange() {

    if (!this.selectedWorkType) {
      this.filteredContractors = [...this.contractors];
      return;
    }

    this.filteredContractors = this.contractors.filter(
      contractor => contractor.natureOfWork === this.selectedWorkType
    );
  }

  delete(id: number) {
    if (confirm('Are you sure you want to delete this contractor?')) {
      this.contractorService.delete(id)
        .subscribe(() => this.fetchContractors());
    }
  }

  view(id: number) {
    this.router.navigate(['/contractors', id]);
  }

  edit(id: number) {
    this.router.navigate(['/contractors/edit', id]);
  }
  testNav() {
  console.log('CLICK WORKING');
  this.router.navigate(['/contractors/create']);
}
}