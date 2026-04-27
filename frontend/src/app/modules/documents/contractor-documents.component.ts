import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-contractor-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contractor-documents.component.html',
  styleUrls: ['./contractor-documents.component.css'],
})
export class ContractorDocumentsComponent implements OnInit {

  projectId!: number;
  documents: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService
  ) {}

  // ================= INIT =================
  ngOnInit() {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDocuments();
  }

  // ================= LOAD =================
  loadDocuments() {
    this.documentService
      .getContractorDocuments(this.projectId)
      .subscribe({

        next: (res: any) => {
          console.log('Contractor Docs:', res);

          // ✅ handle both formats
          this.documents = res?.data || res || [];
        },

        error: (err) => {
          console.error('Failed to load contractor documents', err);
        }

      });
  }

  // ================= VIEW =================
  view(doc: any) {

    const url = this.documentService.downloadDocument(doc.id);

    // ✅ image or pdf preview
    if (doc.fileType?.includes('image') || doc.fileType?.includes('pdf')) {
      window.open(url, '_blank');
    } else {
      alert('Preview not supported, downloading instead');
      this.download(doc.id);
    }
  }

  // ================= DOWNLOAD =================
  download(id: number) {
    window.open(
      this.documentService.downloadDocument(id),
      '_blank'
    );
  }

  // ================= DELETE =================
  delete(doc: any) {

    if (!confirm('Are you sure you want to delete this document?')) return;

    this.documentService.deleteDocument(doc.id)
      .subscribe({

        next: () => {

          // ✅ remove from UI instantly
          this.documents = this.documents.filter(d => d.id !== doc.id);

          alert('✅ Document deleted successfully');
        },

        error: (err) => {
          console.error(err);
          alert('❌ Failed to delete document');
        }

      });
  }

}