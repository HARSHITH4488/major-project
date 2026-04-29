import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { ContractorService } from '../../contractor/contractor.service';
import { DocumentService } from '../../../services/document.service';
import { Router } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';
import { ProjectUpdatesService } from '../../../services/project-updates.service';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule ],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']

})
export class ProjectDetailComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  projectId!: number;
  project: any;
  isEmployee: boolean = false;
  apiUrl = environment.apiUrl;
loadDocuments() {

  if (!this.projectId) return;

  this.documentService
    .getProjectDocuments(this.projectId)
    .subscribe({

      next: (res: any) => {

        console.log("DOCUMENT API RESPONSE:", res);

        if (res?.data) {
          this.documents = res.data;
        } else {
          this.documents = res || [];
        }

      },

      error: (err) => {
        console.error("Document load failed:", err);
      }

    });

}
editingScheduleId: number | null = null;

onFileSelected(event: any) {
  this.selectedFile = event.target.files[0];
}

uploadDocument() {

  if (!this.selectedFile || !this.selectedCategory) {

    Swal.fire({
      icon: 'warning',
      title: 'Select file and category'
    });

    return;
  }

  // ✅ GET LOGGED-IN USER
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const uploadedByName = user?.name || 'Admin';
  const uploadedByRole = 'ADMIN';

  this.documentService.uploadDocument(
    this.projectId,
    this.selectedFile,
    this.selectedCategory,
    uploadedByName,   // ✅ FIX
    uploadedByRole    // ✅ FIX
  ).subscribe({

    next: () => {

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Document uploaded successfully',
        showConfirmButton: false,
        timer: 2000
      });

      // ✅ RESET FORM
      this.selectedFile = undefined as any;
      this.selectedCategory = '';

      // ✅ RESET FILE INPUT
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      if (fileInput) {
        fileInput.value = '';
      }

      // ✅ RELOAD DOCUMENTS
      this.loadDocuments();

    },

    error: (err) => {

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: err?.error?.message || 'Upload failed',
        showConfirmButton: false,
        timer: 2500
      });

    }

  });

}
previewDocument(doc: any) {

  if (doc.fileType.startsWith('image')) {

    const url = this.documentService.downloadDocument(doc.id);

    Swal.fire({
      imageUrl: url,
      imageAlt: doc.fileName,
      width: 800,
      showConfirmButton: false
    });

  } else {

    this.downloadDocument(doc);

  }

}

downloadDocument(doc: any) {
  window.open(this.documentService.downloadDocument(doc.id), '_blank');
}

deleteDocument(doc: any) {

  Swal.fire({
    title: 'Delete Document?',
    text: 'This file will be permanently removed.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel'
  }).then((result) => {

    if (result.isConfirmed) {

      this.documentService.deleteDocument(doc.id)
        .subscribe({

          next: () => {

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Document deleted',
              showConfirmButton: false,
              timer: 2000
            });

            this.loadDocuments();

          },

          error: () => {

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              title: 'Failed to delete document',
              showConfirmButton: false,
              timer: 2000
            });

          }

        });

    }

  });

}
getFileIcon(fileType: string): string {

  if (!fileType) return '📄';

  const type = fileType.toLowerCase();

  if (type.includes('pdf')) return '📕';
  if (type.includes('image') || type.includes('jpg') || type.includes('png')) return '🖼';
  if (type.includes('excel') || type.includes('sheet') || type.includes('xlsx')) return '📊';
  if (type.includes('word') || type.includes('doc')) return '📄';
  if (type.includes('zip') || type.includes('rar')) return '🗜';
  
  return '📁';
}

getScheduleDuration(schedule: any): number {

  const start = new Date(schedule.startDate).getTime();
  const end = new Date(schedule.endDate).getTime();

  const diff = end - start;

  const days = diff / (1000 * 60 * 60 * 24) + 1;

  return days * 40; // width multiplier
}
openSchedule(schedule: any) {

  this.selectedSchedule = schedule;
  this.showTaskPanel = true;

  this.projectService.getScheduleTasks(schedule.id)
    .subscribe((res: any) => {

      if (res?.data) {
        this.scheduleTasks = res.data;
      } else {
        this.scheduleTasks = res || [];
      }

    });

}
addTask() {

  if (!this.newTask.title || !this.newTask.startDate || !this.newTask.endDate) {
    alert('Please fill all fields');
    return;
  }

  const payload = {
    scheduleId: this.selectedSchedule.id,
    title: this.newTask.title,
    startDate: this.newTask.startDate,
    endDate: this.newTask.endDate
  };
  
  /* ================= UPDATE TASK ================= */

  if (this.isEditingTask && this.editingTaskId) {

    this.projectService.updateScheduleTask(
      this.editingTaskId,
      payload
    ).subscribe(() => {

      this.loadScheduleTasks(this.selectedSchedule.id);

      this.isEditingTask = false;
      this.editingTaskId = null;

      this.newTask = {
        title: '',
        startDate: '',
        endDate: ''
      };

    });

  }

  /* ================= CREATE TASK ================= */

  else {

    this.projectService.createScheduleTask(payload)
      .subscribe(() => {

        this.loadScheduleTasks(this.selectedSchedule.id);

        this.newTask = {
          title: '',
          startDate: '',
          endDate: ''
        };

      });

  }

}
updateTaskStatus(task: any, status: string) {

  this.projectService.updateTaskStatus(task.id, status)
    .subscribe({

      next: () => {

        this.openSchedule(this.selectedSchedule);

      }

    });

}

  /* ===============================
     UI STATE
  =================================*/

  showPaymentForm = false;
  showPaymentHistory = false;

  payments: any[] = [];

  /* ===============================
     CONTRACTOR STATE
  =================================*/

  contractors: any[] = [];
  assignedContractors: any[] = [];

  selectedContractorId: number | null = null;
  contractAmount: number = 0;

  /* ===============================
     SCHEDULING STATE
  =================================*/

  showScheduleForm = false;
  schedules: any[] = [];

  scheduleData = {
  contractorId: null as number | null,
  startDate: '',
  endDate: '',
  reminderDaysBefore: 1,
  description: ''
};
/* ===============================
   SCHEDULE TASKS STATE
=================================*/

scheduleTasks: any[] = [];

newTask = {
  title: '',
  startDate: '',
  endDate: ''
};

selectedSchedule: any = null;
showTaskPanel = false;

  /* ===============================
     PROJECT UPDATES STATE
  =================================*/

  updates: any[] = [];
  showUpdateForm = false;

  updateData = {
    contractorId: null as number | null,
    message: '',
    status: 'IN_PROGRESS'
  };

  /* ===============================
     PAYMENT FORM DATA
  =================================*/

  paymentData = {
    amount: 0,
    paymentType: 'ADVANCE',
    paymentDate: '',
    paymentMode: 'BANK',
    notes: ''
  };

 constructor(
  private route: ActivatedRoute,
  private router: Router,
  private projectService: ProjectService,
  public documentService: DocumentService,
  private contractorService: ContractorService,
  private projectUpdatesService: ProjectUpdatesService   // ✅ ADD THIS
) {}
ngOnInit(): void {

  this.projectId = Number(this.route.snapshot.paramMap.get('id'));

  // ✅ ADD THIS (SAFE)
  const role = sessionStorage.getItem('userRole');
  this.isEmployee = role === 'EMPLOYEE';

  this.refreshAll();
  this.loadDocuments();
}
  /* ===============================
     MASTER REFRESH
  =================================*/

  refreshAll() {
    this.loadProject();
    this.loadPayments();
    this.loadAllContractors();
    this.loadAssignedContractors();
    this.loadSchedules();
    this.loadUpdates();
  }

  /* ===============================
     LOAD PROJECT
  =================================*/

  loadProject() {
    this.projectService.getById(this.projectId).subscribe({
      next: (res: any) => this.project = res.data,
      error: (err: any) => console.error(err)
    });
  }
  

  /* ===============================
     LOAD PAYMENTS
  =================================*/

  loadPayments() {
    this.projectService.getPayments(this.projectId).subscribe({
      next: (res: any) => this.payments = res.data || [],
      error: (err: any) => console.error(err)
    });
  }

  /* ===============================
     LOAD CONTRACTORS
  =================================*/

  loadAllContractors() {
    this.contractorService.getAll(1, 1000).subscribe({
      next: (res: any) => {

        if (res?.data?.data) {
          this.contractors = res.data.data;
        } else if (res?.data) {
          this.contractors = res.data;
        } else {
          this.contractors = [];
        }

      },
      error: (err: any) => console.error(err)
    });
  }

  /* ===============================
     LOAD ASSIGNED CONTRACTORS
  =================================*/

  loadAssignedContractors() {
    this.projectService.getProjectContractors(this.projectId).subscribe({
      next: (res: any) => {

        if (res?.data) {
          this.assignedContractors = res.data;
        } else {
          this.assignedContractors = res || [];
        }

      },
      error: (err: any) => console.error(err)
    });
  }

  /* ===============================
     LOAD SCHEDULES
  =================================*/

  loadSchedules() {

  this.projectService.getSchedulesByProject(this.projectId)
    .subscribe({

      next: (res: any) => {

        console.log("Schedules API response:", res);

        if (res?.data) {
          this.schedules = res.data;
        }
        else {
          this.schedules = res || [];
        }

      },

      error: (err: any) => console.error(err)

    });

}
/* ===============================
   LOAD TASKS FOR A SCHEDULE
=================================*/

loadScheduleTasks(scheduleId: number) {

  this.projectService.getScheduleTasks(scheduleId)
    .subscribe({

      next: (res: any) => {

        if (res?.data) {
          this.scheduleTasks = res.data;
        }
        else {
          this.scheduleTasks = res || [];
        }

      },

      error: (err: any) => {
        console.error('Failed to load tasks', err);
      }

    });

}

  

  /* ===============================
   LOAD PROJECT UPDATES
=================================*/

loadUpdates() {

  this.projectUpdatesService
    .getUpdatesByProject(this.projectId)
    .subscribe({

      next: (res: any) => {

        console.log('UPDATES API:', res);

        if (res?.data) {
          this.updates = res.data;
        } else {
          this.updates = res || [];
        }

      },

      error: (err: any) => {
        console.error('Failed to load updates', err);
      }

    });

}

/* ===============================
   DELETE PROJECT UPDATE
=================================*/

confirmDeleteUpdate(updateId: number) {

  Swal.fire({
    title: 'Delete Update?',
    text: 'This will permanently delete the update.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    confirmButtonText: 'Delete'
  }).then((result) => {

    if (result.isConfirmed) {

      this.projectUpdatesService.deleteUpdate(updateId)
        .subscribe({

          next: () => {

            // ✅ Instant UI update (no reload)
            this.updates = this.updates.filter(u => u.id !== updateId);

            Swal.fire({
              icon: 'success',
              title: 'Update deleted',
              timer: 1200,
              showConfirmButton: false
            });

          },

          error: () => {

            Swal.fire({
              icon: 'error',
              title: 'Failed to delete update'
            });

          }

        });

    }

  });

}

/* ===============================
   IMAGE PREVIEW (ADD HERE 👇)
=================================*/
previewImage(photo: string) {

  if (!photo) return;

 const imageUrl = `${this.apiUrl}/uploads/project-updates/${photo}`;

  Swal.fire({
    imageUrl: imageUrl,
    imageAlt: 'Project Update',
    width: 800,
    background: '#000',
    showConfirmButton: false
  });
}

activeTab: string = 'overview';

  /* ===============================
     CREATE PROJECT UPDATE
  =================================*/

  createUpdate() {

    if (!this.updateData.contractorId || !this.updateData.message) {
      Swal.fire({
        icon: 'warning',
        title: 'Please fill required fields'
      });
      return;
    }

    const payload = {
      projectId: this.projectId,
      contractorId: this.updateData.contractorId,
      message: this.updateData.message,
      status: this.updateData.status
    };

    this.projectService.createProjectUpdate(payload).subscribe({

      next: () => {

        Swal.fire({
          icon: 'success',
          title: 'Update posted',
          timer: 1200,
          showConfirmButton: false
        });

        this.updateData = {
          contractorId: null,
          message: '',
          status: 'IN_PROGRESS'
        };

        this.showUpdateForm = false;
        this.loadUpdates();
      },

      error: (err: any) => {
        Swal.fire({
          icon: 'error',
          title: err?.error?.message || 'Failed to post update'
        });
      }

    });
  }
  /* ===============================
   TOGGLE PAYMENT HISTORY
=================================*/

togglePaymentHistory() {
  this.showPaymentHistory = !this.showPaymentHistory;
}
  /* ===============================
   CHECK IF CONTRACTOR ASSIGNED
=================================*/

isAlreadyAssigned(contractorId: number): boolean {

  return this.assignedContractors?.some(
    (assigned) => assigned.id === contractorId
  );

}
/* ===============================
   ADD PAYMENT
=================================*/

addPayment() {

  if (!this.paymentData.amount || !this.paymentData.paymentDate) {

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title: 'Please fill required fields',
      showConfirmButton: false,
      timer: 2000
    });

    return;
  }

  const payload = {
    amount: Number(this.paymentData.amount),
    paymentType: this.paymentData.paymentType,
    paymentDate: this.paymentData.paymentDate,
    paymentMode: this.paymentData.paymentMode,
    notes: this.paymentData.notes || null
  };

  this.projectService.addPayment(this.projectId, payload)
    .subscribe({

      next: () => {

        this.showPaymentForm = false;

        this.paymentData = {
          amount: 0,
          paymentType: 'ADVANCE',
          paymentDate: '',
          paymentMode: 'BANK',
          notes: ''
        };

        this.refreshAll();
      },

      error: (err) => console.error(err)

    });

}

  /* ===============================
     CREATE SCHEDULE
  =================================*/

  createSchedule() {

    if (!this.scheduleData.contractorId ||
        !this.scheduleData.startDate ||
        !this.scheduleData.endDate) {

      Swal.fire({
        icon: 'warning',
        title: 'Please fill all required fields'
      });
      return;
    }

    const contractor = this.assignedContractors.find(
      c => c.id === Number(this.scheduleData.contractorId)
    );

    const payload = {
  projectId: this.projectId,
  contractorId: this.scheduleData.contractorId,
  workType: contractor?.natureOfWork || 'General',
  startDate: this.scheduleData.startDate,
  endDate: this.scheduleData.endDate,
  reminderDaysBefore: this.scheduleData.reminderDaysBefore,
  description: this.scheduleData.description
};

    this.projectService.createSchedule(payload).subscribe({

      next: () => {

        Swal.fire({
          icon: 'success',
          title: 'Work scheduled successfully',
          timer: 1500,
          showConfirmButton: false
        });

        this.scheduleData = {
  contractorId: null,
  startDate: '',
  endDate: '',
  reminderDaysBefore: 1,
  description: ''
};

        this.showScheduleForm = false;
        this.loadSchedules();
      },

      error: (err: any) => {
        Swal.fire({
          icon: 'error',
          title: err?.error?.message || 'Scheduling failed'
        });
      }

    });
  }
  markScheduleCompleted(scheduleId: number) {

  this.projectService.updateScheduleStatus(scheduleId, 'COMPLETED')
    .subscribe({

      next: () => {

        Swal.fire({
          icon: 'success',
          title: 'Work marked as completed',
          timer: 1200,
          showConfirmButton: false
        });

        this.loadSchedules();

      },

      error: () => {

        Swal.fire({
          icon: 'error',
          title: 'Failed to update schedule'
        });

      }

    });

}
  /* ===============================
     ASSIGN CONTRACTOR
  =================================*/

  assignContractor() {

    if (!this.selectedContractorId) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Please select a contractor',
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    if (!this.contractAmount || this.contractAmount <= 0) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Please enter valid contract amount',
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    const payload = {
      contractorId: this.selectedContractorId,
      contractAmount: Number(this.contractAmount)
    };

    this.projectService.assignContractor(this.projectId, payload).subscribe({

      next: () => {

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Contractor assigned successfully',
          showConfirmButton: false,
          timer: 2000
        });

        this.selectedContractorId = null;
        this.contractAmount = 0;

        this.loadAssignedContractors();
      },

      error: (err: any) => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: err?.error?.message || 'Assignment failed',
          showConfirmButton: false,
          timer: 2500
        });
      }

    });
  }
  documents: any[] = [];
selectedFile!: File;
selectedCategory = '';
selectedDocument: any = null;
searchText: string = '';

selectedShareContractorIds: number[] = []; // already added
openShareDropdownId: number | null = null; // ✅ ADD THIS
  /* ===============================
     REMOVE CONTRACTOR
  =================================*/

  removeContractor(contractorId: number) {

    Swal.fire({
      title: 'Remove Contractor?',
      text: 'This will unlink contractor from project.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel'
    })
    .then((result) => {

      if (result.isConfirmed) {

        this.projectService.removeContractor(this.projectId, contractorId)
          .subscribe({

            next: () => {

              Swal.fire({
                icon: 'success',
                title: 'Removed!',
                timer: 1200,
                showConfirmButton: false
              });

              this.loadAssignedContractors();

            },

            error: () => {

              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to remove contractor.'
              });

            }

          });

      }

    });
  }

  /* ===============================
     DELETE PAYMENT
  =================================*/

  onDeletePayment(paymentId: number) {

    Swal.fire({
      title: 'Delete Payment?',
      text: 'This will update the project financial summary.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    })
    .then((result) => {

      if (result.isConfirmed) {

        this.projectService.deletePayment(paymentId)
          .subscribe({

            next: () => {

              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                timer: 1500,
                showConfirmButton: false
              });

              this.refreshAll();

            },

            error: () => {

              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete payment.'
              });

            }

          });

      }

    });
  }
  /* ===============================
   DELETE SCHEDULE
=================================*/

deleteSchedule(scheduleId: number) {

  Swal.fire({
    title: 'Delete Schedule?',
    text: 'This will delete the schedule and its tasks.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    confirmButtonText: 'Delete'
  }).then((result) => {

    if (result.isConfirmed) {

      this.projectService.deleteSchedule(scheduleId)
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Schedule deleted',
              timer: 1200,
              showConfirmButton: false
            });

            this.loadSchedules();

          },

          error: () => {

            Swal.fire({
              icon: 'error',
              title: 'Failed to delete schedule'
            });

          }

        });

    }

  });

}
/* ===============================
   DELETE TASK
=================================*/

deleteTask(taskId: number) {

  Swal.fire({
    title: 'Delete Task?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    confirmButtonText: 'Delete'
  }).then((result) => {

    if (result.isConfirmed) {

      this.projectService.deleteScheduleTask(taskId)
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Task deleted',
              timer: 1000,
              showConfirmButton: false
            });

            this.openSchedule(this.selectedSchedule);

          }

        });

    }

  });
}
isEditingTask = false;
editingTaskId: number | null = null;

taskForm = {
  id: null as number | null,
  title: '',
  startDate: '',
  endDate: ''
};

editSchedule(schedule: any) {

  this.showScheduleForm = true;

  this.scheduleData = {
    contractorId: schedule.contractor?.id,
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    description: schedule.description,
    reminderDaysBefore: schedule.reminderDaysBefore || 1
  };

  this.editingScheduleId = schedule.id;

}
editTask(task: any) {

  this.newTask = {
    title: task.title,
    startDate: task.startDate,
    endDate: task.endDate
  };

  this.isEditingTask = true;
  this.editingTaskId = task.id;

}
/* ===============================
   SCHEDULE NAVIGATION
=================================*/

openSchedulePage() {

  if (!this.projectId) return;

  this.router.navigate(['/schedule/create', this.projectId]);

}

openTimelinePage() {

  if (!this.projectId) return;

  this.router.navigate(['/schedule/timeline', this.projectId]);

}

openTaskManager() {

  if (!this.projectId) return;

  this.router.navigate(['/schedule/tasks', this.projectId]);

}
selectDocument(doc: any) {
  this.selectedDocument = doc;
}
get filteredDocuments() {
  if (!this.searchText) return this.documents;

  return this.documents.filter(doc =>
    doc.fileName.toLowerCase().includes(this.searchText.toLowerCase())
  );
}

shareDocument(doc: any) {

  if (!this.selectedShareContractorIds || this.selectedShareContractorIds.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Select at least one contractor'
    });
    return;
  }

  this.documentService
    .shareDocument(doc.id, this.selectedShareContractorIds)
    .subscribe({

      next: () => {

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Document shared successfully',
          showConfirmButton: false,
          timer: 2000
        });

        this.selectedShareContractorIds = [];
        this.openShareDropdownId = null;

      },

      error: () => {

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Failed to share document',
          showConfirmButton: false,
          timer: 2000
        });

      }

    });

}

// 👇 ✅ ADD HERE (RIGHT AFTER shareDocument)

onContractorToggle(contractorId: number, event: any) {

  if (event.target.checked) {

    if (!this.selectedShareContractorIds.includes(contractorId)) {
      this.selectedShareContractorIds.push(contractorId);
    }

  } else {

    this.selectedShareContractorIds =
      this.selectedShareContractorIds.filter(id => id !== contractorId);

  }

}
toggleShareDropdown(docId: number) {

  if (this.openShareDropdownId === docId) {
    this.openShareDropdownId = null; // close if already open
  } else {
    this.openShareDropdownId = docId; // open clicked one
  }

}
}